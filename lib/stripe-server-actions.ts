// PHASE 1: Stripe Connect Express Onboarding - Server Actions
// Server-side functions for managing Stripe Connect Express accounts for clubs

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! // Use service role for server actions
);

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface CreateStripeAccountParams {
  clubId: string;
  clubName: string;
  clubSubdomain: string;
  ownerEmail: string;
  ownerName: string;
  businessType: "individual" | "company";
  country: string; // ISO 3166-1 alpha-2 country code
}

export interface AccountLinkParams {
  clubId: string;
  returnUrl?: string;
  refreshUrl?: string;
}

export interface StripeAccountStatus {
  club_id: string;
  club_name: string;
  stripe_account_id: string | null;
  onboarding_completed: boolean;
  charges_enabled: boolean;
  details_submitted: boolean;
  onboarding_completed_at: string | null;
  requires_onboarding: boolean;
}

// =============================================================================
// CREATE STRIPE EXPRESS ACCOUNT
// =============================================================================

export async function createStripeAccount(
  params: CreateStripeAccountParams
): Promise<{
  success: boolean;
  data?: { accountId: string; onboardingUrl?: string };
  error?: string;
}> {
  try {
    // Verify user has permission to create Stripe account for this club
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if user is owner/admin of this club
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("role, club_id")
      .eq("id", user.id)
      .single();

    if (
      !userProfile ||
      userProfile.club_id !== params.clubId ||
      !["owner", "admin"].includes(userProfile.role)
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Check if club already has a Stripe account
    const { data: club } = await supabase
      .from("clubs")
      .select("stripe_account_id, name")
      .eq("id", params.clubId)
      .single();

    if (club?.stripe_account_id) {
      return {
        success: false,
        error: `Club already has Stripe account: ${club.stripe_account_id}`,
      };
    }

    // Create Stripe Express account
    const stripeAccount = await stripe.accounts.create({
      type: "express",
      country: params.country,
      email: params.ownerEmail,
      business_type: params.businessType,
      company:
        params.businessType === "company"
          ? {
              name: params.clubName,
            }
          : undefined,
      individual:
        params.businessType === "individual"
          ? {
              email: params.ownerEmail,
              first_name: params.ownerName.split(" ")[0],
              last_name:
                params.ownerName.split(" ").slice(1).join(" ") ||
                params.ownerName,
            }
          : undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      settings: {
        payouts: {
          schedule: {
            interval: "weekly", // Weekly payouts
            weekly_anchor: "friday", // Pay on Fridays
          },
        },
      },
      metadata: {
        club_id: params.clubId,
        club_name: params.clubName,
        club_subdomain: params.clubSubdomain,
      },
    });

    // Update club in database with Stripe account ID
    const { error: updateError } = await supabase
      .from("clubs")
      .update({
        stripe_account_id: stripeAccount.id,
        stripe_onboarding_completed: false,
        stripe_charges_enabled: false,
        stripe_details_submitted: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.clubId);

    if (updateError) {
      console.error(
        "Failed to update club with Stripe account ID:",
        updateError
      );
      // Attempt to delete the Stripe account since DB update failed
      await stripe.accounts.del(stripeAccount.id);
      return { success: false, error: "Failed to save Stripe account ID" };
    }

    // Generate onboarding account link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/stripe/onboarding?refresh=true&club_id=${params.clubId}`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/stripe/onboarding?success=true&club_id=${params.clubId}`,
      type: "account_onboarding",
    });

    return {
      success: true,
      data: {
        accountId: stripeAccount.id,
        onboardingUrl: accountLink.url,
      },
    };
  } catch (error) {
    console.error("Error creating Stripe account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// GENERATE ACCOUNT LINK FOR EXISTING ACCOUNT
// =============================================================================

export async function generateAccountLink(params: AccountLinkParams): Promise<{
  success: boolean;
  data?: { onboardingUrl: string };
  error?: string;
}> {
  try {
    // Verify user has permission
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get club and verify user permissions
    const { data: club } = await supabase
      .from("clubs")
      .select("stripe_account_id, name")
      .eq("id", params.clubId)
      .single();

    if (!club) {
      return { success: false, error: "Club not found" };
    }

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("role, club_id")
      .eq("id", user.id)
      .single();

    if (
      !userProfile ||
      userProfile.club_id !== params.clubId ||
      !["owner", "admin"].includes(userProfile.role)
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    if (!club.stripe_account_id) {
      return { success: false, error: "Club does not have a Stripe account" };
    }

    // Generate account link for re-onboarding or status updates
    const accountLink = await stripe.accountLinks.create({
      account: club.stripe_account_id,
      refresh_url:
        params.refreshUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/admin/stripe/onboarding?refresh=true&club_id=${params.clubId}`,
      return_url:
        params.returnUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL}/admin/stripe/onboarding?success=true&club_id=${params.clubId}`,
      type: "account_onboarding",
    });

    return {
      success: true,
      data: {
        onboardingUrl: accountLink.url,
      },
    };
  } catch (error) {
    console.error("Error generating account link:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// GET CLUB STRIPE STATUS
// =============================================================================

export async function getClubStripeStatus(clubId: string): Promise<{
  success: boolean;
  data?: StripeAccountStatus;
  error?: string;
}> {
  try {
    // Verify user has permission
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("role, club_id")
      .eq("id", user.id)
      .single();

    if (
      !userProfile ||
      userProfile.club_id !== clubId ||
      !["owner", "admin"].includes(userProfile.role)
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Get club Stripe status from database
    const { data, error } = await supabase.rpc("get_club_stripe_status", {
      p_club_id: clubId,
    });

    if (error) {
      console.error("Error fetching club Stripe status:", error);
      return { success: false, error: "Failed to fetch Stripe status" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error getting club Stripe status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// UPDATE STRIPE ACCOUNT STATUS (for webhooks)
// =============================================================================

export async function updateStripeAccountStatus(
  accountId: string,
  chargesEnabled: boolean,
  detailsSubmitted: boolean
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // This should typically be called by webhook handler with service role key
    // Find club by Stripe account ID
    const { data: club } = await supabase
      .from("clubs")
      .select("id")
      .eq("stripe_account_id", accountId)
      .single();

    if (!club) {
      return { success: false, error: "Club not found for Stripe account" };
    }

    // Update club Stripe status
    const { error } = await supabase
      .from("clubs")
      .update({
        stripe_charges_enabled: chargesEnabled,
        stripe_details_submitted: detailsSubmitted,
        stripe_onboarding_completed: chargesEnabled && detailsSubmitted,
        stripe_onboarding_completed_at:
          chargesEnabled && detailsSubmitted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", club.id);

    if (error) {
      console.error("Error updating club Stripe status:", error);
      return { success: false, error: "Failed to update Stripe status" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating Stripe account status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// GET STRIPE EXPRESS DASHBOARD LINK
// =============================================================================

export async function getStripeDashboardLink(clubId: string): Promise<{
  success: boolean;
  data?: { dashboardUrl: string };
  error?: string;
}> {
  try {
    // Verify user has permission
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("role, club_id")
      .eq("id", user.id)
      .single();

    if (
      !userProfile ||
      userProfile.club_id !== clubId ||
      !["owner", "admin"].includes(userProfile.role)
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Get club's Stripe account ID
    const { data: club } = await supabase
      .from("clubs")
      .select("stripe_account_id, stripe_onboarding_completed")
      .eq("id", clubId)
      .single();

    if (!club || !club.stripe_account_id) {
      return { success: false, error: "Club does not have a Stripe account" };
    }

    if (!club.stripe_onboarding_completed) {
      return { success: false, error: "Stripe onboarding not completed" };
    }

    // Create login link for Stripe Express Dashboard
    const loginLink = await stripe.accounts.createLoginLink(
      club.stripe_account_id
    );

    return {
      success: true,
      data: {
        dashboardUrl: loginLink.url,
      },
    };
  } catch (error) {
    console.error("Error creating Stripe dashboard link:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// VERIFY STRIPE ACCOUNT STATUS FROM STRIPE API
// =============================================================================

export async function verifyStripeAccountStatus(clubId: string): Promise<{
  success: boolean;
  data?: {
    charges_enabled: boolean;
    details_submitted: boolean;
    payouts_enabled: boolean;
    requirements: {
      currently_due: string[];
      eventually_due: string[];
      past_due: string[];
    };
  };
  error?: string;
}> {
  try {
    // Verify user has permission
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("role, club_id")
      .eq("id", user.id)
      .single();

    if (
      !userProfile ||
      userProfile.club_id !== clubId ||
      !["owner", "admin"].includes(userProfile.role)
    ) {
      return { success: false, error: "Insufficient permissions" };
    }

    // Get club's Stripe account ID
    const { data: club } = await supabase
      .from("clubs")
      .select("stripe_account_id")
      .eq("id", clubId)
      .single();

    if (!club || !club.stripe_account_id) {
      return { success: false, error: "Club does not have a Stripe account" };
    }

    // Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(club.stripe_account_id);

    return {
      success: true,
      data: {
        charges_enabled: account.charges_enabled,
        details_submitted: account.details_submitted,
        payouts_enabled: account.payouts_enabled,
        requirements: {
          currently_due: account.requirements?.currently_due || [],
          eventually_due: account.requirements?.eventually_due || [],
          past_due: account.requirements?.past_due || [],
        },
      },
    };
  } catch (error) {
    console.error("Error verifying Stripe account status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// HELPER FUNCTIONS FOR WEBHOOKS
// =============================================================================

/**
 * Handle Stripe webhook events
 * This should be called from your Stripe webhook endpoint
 */
export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (event.type) {
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const chargesEnabled = account.charges_enabled;
        const detailsSubmitted = account.details_submitted;

        await updateStripeAccountStatus(
          account.id,
          chargesEnabled,
          detailsSubmitted
        );
        break;
      }

      case "account.application.deauthorized": {
        const account = event.data.object as Stripe.Account;
        // Handle account disconnection
        await updateStripeAccountStatus(account.id, false, false);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error handling Stripe webhook:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/**
 * Server Action example for creating Stripe account:
 *
 * ```tsx
 * export async function createClubStripeAccount(formData: FormData) {
 *   'use server'
 *
 *   const result = await createStripeAccount({
 *     clubId: formData.get('clubId') as string,
 *     clubName: formData.get('clubName') as string,
 *     clubSubdomain: formData.get('clubSubdomain') as string,
 *     ownerEmail: formData.get('ownerEmail') as string,
 *     ownerName: formData.get('ownerName') as string,
 *     businessType: formData.get('businessType') as 'individual' | 'company',
 *     country: 'NL', // Netherlands
 *   })
 *
 *   return result
 * }
 * ```
 */

/**
 * Server Action example for getting onboarding URL:
 *
 * ```tsx
 * export async function startStripeOnboarding(clubId: string) {
 *   'use server'
 *
 *   const result = await generateAccountLink({
 *     clubId,
 *     returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard?stripe=onboarding-complete`,
 *     refreshUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard?stripe=refresh`,
 *   })
 *
 *   return result
 * }
 * ```
 */
