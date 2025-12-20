// PHASE 1: Stripe Connect Express Onboarding - Frontend Component
// React component for managing Stripe Connect onboarding in admin dashboard

"use client";

import { useState, useEffect } from "react";
import {
  createStripeAccount,
  getClubStripeStatus,
  generateAccountLink,
  getStripeDashboardLink,
  verifyStripeAccountStatus,
  type StripeAccountStatus,
} from "@/lib/stripe-server-actions";

// Icons (you can replace with your preferred icon library)
const CreditCardIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-5 h-5 text-green-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
    />
  </svg>
);
);

// Component Props Interface
interface StripeConnectButtonProps {
  clubId: string;
  clubName: string;
  clubSubdomain: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  showStatus?: boolean;
}

// Loading States
interface ButtonState {
  isLoading: boolean;
  loadingText?: string;
  error?: string;
}

// Main Component
export function StripeConnectButton({
  clubId,
  clubName,
  clubSubdomain,
  className = "",
  size = "md",
  variant = "primary",
  showStatus = true,
}: StripeConnectButtonProps) {
  const [stripeStatus, setStripeStatus] = useState<StripeAccountStatus | null>(
    null
  );
  const [buttonState, setButtonState] = useState<ButtonState>({
    isLoading: false,
  });
  const [needsVerification, setNeedsVerification] = useState(false);

  // Size and variant classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
    secondary: "bg-white hover:bg-gray-50 text-blue-600 border-blue-600",
  };

  // Load Stripe status on component mount
  useEffect(() => {
    loadStripeStatus();
  }, [clubId]);

  const loadStripeStatus = async () => {
    try {
      const result = await getClubStripeStatus(clubId);
      if (result.success && result.data) {
        setStripeStatus(result.data);

        // Check if status needs verification from Stripe API
        if (result.data.stripe_account_id && result.data.onboarding_completed) {
          setNeedsVerification(true);
        }
      }
    } catch (error) {
      console.error("Failed to load Stripe status:", error);
    }
  };

  const handleCreateAccount = async () => {
    setButtonState({
      isLoading: true,
      loadingText: "Creating Stripe account...",
    });

    try {
      const result = await createStripeAccount({
        clubId,
        clubName,
        clubSubdomain,
        ownerEmail: "owner@example.com", // You should get this from user context
        ownerName: "Club Owner", // You should get this from user context
        businessType: "individual", // Or 'company' based on club type
        country: "NL", // Netherlands - adjust based on club location
      });

      if (result.success && result.data?.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = result.data.onboardingUrl;
      } else {
        setButtonState({
          isLoading: false,
          error: result.error || "Failed to create Stripe account",
        });
      }
    } catch (error) {
      setButtonState({
        isLoading: false,
        error: "An unexpected error occurred",
      });
    }
  };

  const handleContinueOnboarding = async () => {
    setButtonState({
      isLoading: true,
      loadingText: "Opening Stripe onboarding...",
    });

    try {
      const result = await generateAccountLink({
        clubId,
        returnUrl: `${window.location.origin}/admin/dashboard?stripe=success`,
        refreshUrl: `${window.location.origin}/admin/dashboard?stripe=refresh`,
      });

      if (result.success && result.data?.onboardingUrl) {
        window.location.href = result.data.onboardingUrl;
      } else {
        setButtonState({
          isLoading: false,
          error: result.error || "Failed to open onboarding",
        });
      }
    } catch (error) {
      setButtonState({
        isLoading: false,
        error: "An unexpected error occurred",
      });
    }
  };

  const handleOpenDashboard = async () => {
    setButtonState({
      isLoading: true,
      loadingText: "Opening Stripe Dashboard...",
    });

    try {
      const result = await getStripeDashboardLink(clubId);

      if (result.success && result.data?.dashboardUrl) {
        window.open(result.data.dashboardUrl, "_blank", "noopener,noreferrer");
        setButtonState({ isLoading: false });
      } else {
        setButtonState({
          isLoading: false,
          error: result.error || "Failed to open dashboard",
        });
      }
    } catch (error) {
      setButtonState({
        isLoading: false,
        error: "An unexpected error occurred",
      });
    }
  };

  const handleVerifyStatus = async () => {
    setButtonState({
      isLoading: true,
      loadingText: "Verifying account status...",
    });

    try {
      const result = await verifyStripeAccountStatus(clubId);

      if (result.success) {
        // Reload status after verification
        await loadStripeStatus();
        setButtonState({ isLoading: false });
      } else {
        setButtonState({
          isLoading: false,
          error: result.error || "Failed to verify status",
        });
      }
    } catch (error) {
      setButtonState({
        isLoading: false,
        error: "An unexpected error occurred",
      });
    }
  };

  // Render different states based on Stripe account status
  const renderButton = () => {
    if (!stripeStatus) {
      return (
        <button
          disabled
          className={`${sizeClasses[size]} ${variantClasses[variant]} 
            border rounded-lg font-medium transition-colors duration-200 
            flex items-center gap-2 opacity-50 cursor-not-allowed`}
        >
          <CreditCardIcon />
          Loading...
        </button>
      );
    }

    // Account exists and is fully set up
    if (
      stripeStatus.stripe_account_id &&
      stripeStatus.charges_enabled &&
      stripeStatus.details_submitted
    ) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={handleOpenDashboard}
              disabled={buttonState.isLoading}
              className={`${sizeClasses[size]} bg-green-600 hover:bg-green-700 text-white
                border border-green-600 rounded-lg font-medium transition-colors duration-200
                flex items-center gap-2`}
            >
              <CheckIcon />
              Bankrekening Gekoppeld
              <ExternalLinkIcon />
            </button>
            
            {/* Manual Refresh Button for Development */}
            <button
              onClick={handleVerifyStatus}
              disabled={buttonState.isLoading}
              className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700
                border border-gray-300 rounded-lg font-medium transition-colors duration-200
                flex items-center gap-1"
              title="Refresh Status (Development)"
            >
              {buttonState.isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <RefreshIcon />
              )}
              Refresh
            </button>
          </div>
        </div>
      );
    }

    // Account exists but needs more setup
    if (stripeStatus.stripe_account_id && !stripeStatus.charges_enabled) {
      return (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleContinueOnboarding}
            disabled={buttonState.isLoading}
            className={`${sizeClasses[size]} ${variantClasses[variant]}
              border rounded-lg font-medium transition-colors duration-200
              flex items-center gap-2`}
          >
            <CreditCardIcon />
            {buttonState.isLoading
              ? buttonState.loadingText
              : "Continue Onboarding"}
          </button>
          
          {/* Manual Refresh Button for Development */}
          <button
            onClick={handleVerifyStatus}
            disabled={buttonState.isLoading}
            className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700
              border border-gray-300 rounded-lg font-medium transition-colors duration-200
              flex items-center gap-1 w-fit"
            title="Refresh Status (Development)"
          >
            {buttonState.isLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshIcon />
            )}
            Refresh Status
          </button>
        </div>
      );
    }

    // No Stripe account - create new one
    return (
      <button
        onClick={handleCreateAccount}
        disabled={buttonState.isLoading}
        className={`${sizeClasses[size]} ${variantClasses[variant]} 
          border rounded-lg font-medium transition-colors duration-200 
          flex items-center gap-2`}
      >
        <CreditCardIcon />
        {buttonState.isLoading
          ? buttonState.loadingText
          : "Koppel Bankrekening"}
      </button>
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Button */}
      {renderButton()}

      {/* Error Message */}
      {buttonState.error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="font-medium">Error</div>
          <div>{buttonState.error}</div>
          <button
            onClick={() => setButtonState({ isLoading: false })}
            className="text-xs text-red-700 hover:text-red-800 underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Status Information */}
      {showStatus && stripeStatus && (
        <div className="text-xs text-gray-500 space-y-1">
          {stripeStatus.stripe_account_id && (
            <div className="flex items-center gap-1">
              <span>Account ID:</span>
              <code className="bg-gray-100 px-1 rounded text-xs">
                {stripeStatus.stripe_account_id}
              </code>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  stripeStatus.details_submitted
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              />
              <span>Details Submitted</span>
            </div>
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  stripeStatus.charges_enabled
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              />
              <span>Charges Enabled</span>
            </div>
          </div>

          {stripeStatus.onboarding_completed_at && (
            <div className="text-gray-400">
              Completed:{" "}
              {new Date(
                stripeStatus.onboarding_completed_at
              ).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      {!stripeStatus?.charges_enabled && (
        <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="font-medium text-blue-800 mb-1">
            💡 Stripe Connect Information
          </div>
          <div>
            Stripe Connect allows your club to receive payments directly. You'll
            need to complete business verification to start accepting bookings.
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/**
 * Basic Usage:
 *
 * ```tsx
 * import { StripeConnectButton } from '@/components/StripeConnectButton'
 *
 * function ClubAdminPage() {
 *   return (
 *     <div>
 *       <h1>Payment Settings</h1>
 *       <StripeConnectButton
 *         clubId="club-uuid"
 *         clubName="Tennis Club Amsterdam"
 *         clubSubdomain="amsterdam"
 *       />
 *     </div>
 *   )
 * }
 * ```
 */

/**
 * In Admin Layout:
 *
 * ```tsx
 * function AdminLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <div className="admin-layout">
 *       <nav>
 *         <StripeConnectButton
 *           clubId={currentClub.id}
 *           clubName={currentClub.name}
 *           clubSubdomain={currentClub.subdomain}
 *           size="sm"
 *           variant="secondary"
 *           showStatus={false}
 *         />
 *       </nav>
 *       <main>{children}</main>
 *     </div>
 *   )
 * }
 * ```
 */

/**
 * With custom styling:
 *
 * ```tsx
 * <StripeConnectButton
 *   clubId="club-uuid"
 *   clubName="My Tennis Club"
 *   clubSubdomain="myclub"
 *   className="mb-6"
 *   size="lg"
 *   variant="primary"
 *   showStatus={true}
 * />
 * ```
 */
