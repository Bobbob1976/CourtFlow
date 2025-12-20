-- supabase/migrations/012_b2b_invoicing.sql

-- Create a table to store company information
CREATE TABLE public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    vat_number TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a junction table to link users to companies
CREATE TABLE public.company_users (
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (company_id, user_id)
);

-- Create a table to store monthly invoices
CREATE TABLE public.invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- draft, open, paid, void
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a table to store invoice line items
CREATE TABLE public.invoice_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own company"
ON public.companies
FOR ALL
USING (id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
));

CREATE POLICY "Allow users to view their company users"
ON public.company_users
FOR SELECT
USING (company_id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
));

CREATE POLICY "Allow users to manage their company invoices"
ON public.invoices
FOR ALL
USING (company_id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
));

CREATE POLICY "Allow users to view their company invoice items"
ON public.invoice_items
FOR SELECT
USING (invoice_id IN (
    SELECT id FROM public.invoices WHERE company_id IN (
        SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
    )
));

-- Function to generate monthly invoices for all companies
CREATE OR REPLACE FUNCTION generate_monthly_invoices()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    company RECORD;
    booking RECORD;
    new_invoice_id UUID;
    invoice_total NUMERIC(10, 2);
BEGIN
    FOR company IN SELECT * FROM public.companies LOOP
        invoice_total := 0;

        -- Create a new invoice
        INSERT INTO public.invoices (company_id, invoice_number, issue_date, due_date, total_amount)
        VALUES (company.id, 'INV-' || to_char(NOW(), 'YYYYMM') || '-' || company.id, NOW(), NOW() + INTERVAL '30 days', 0)
        RETURNING id INTO new_invoice_id;

        -- Add all bookings from the last month as line items
        FOR booking IN
            SELECT b.*
            FROM public.bookings b
            JOIN public.company_users cu ON b.user_id = cu.user_id
            WHERE cu.company_id = company.id
            AND b.booking_date >= date_trunc('month', NOW() - INTERVAL '1 month')
            AND b.booking_date < date_trunc('month', NOW())
        LOOP
            INSERT INTO public.invoice_items (invoice_id, booking_id, description, quantity, unit_price, total_price)
            VALUES (new_invoice_id, booking.id, 'Court Booking ' || to_char(booking.booking_date, 'YYYY-MM-DD'), 1, booking.total_cost, booking.total_cost);

            invoice_total := invoice_total + booking.total_cost;
        END LOOP;

        -- Update the total amount on the invoice
        UPDATE public.invoices
        SET total_amount = invoice_total
        WHERE id = new_invoice_id;
    END LOOP;
END;
$$;
