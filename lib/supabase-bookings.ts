// PHASE 1: Atomic Booking Engine - TypeScript Client Library
// Examples for calling the create_atomic_booking PostgreSQL function

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// =============================================================================
// ATOMIC BOOKING FUNCTION CALL
// =============================================================================

export interface CreateBookingParams {
  club_id: string
  court_id: string
  start_time: string // Format: "HH:MM:SS"
  end_time: string   // Format: "HH:MM:SS"
  total_price: number
  booking_date?: string // Format: "YYYY-MM-DD", defaults to today
  attendees?: number
  booking_notes?: string
}

export interface BookingResult {
  id: string
  club_id: string
  court_id: string
  user_id: string
  booking_date: string
  start_time: string
  end_time: string
  total_cost: number
  status: string
  payment_status: string
  attendees: number
  booking_notes?: string
  created_at: string
  time_range: string // tstzrange
}

/**
 * Creates an atomic booking using the PostgreSQL stored procedure
 * Guarantees no double bookings even with concurrent requests
 */
export async function createBooking(params: CreateBookingParams): Promise<{
  data?: BookingResult
  error?: string
}> {
  try {
    const { data, error } = await supabase.rpc('create_atomic_booking', {
      p_club_id: params.club_id,
      p_court_id: params.court_id,
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_start_time: params.start_time,
      p_end_time: params.end_time,
      p_total_price: params.total_price,
      p_booking_date: params.booking_date ?? new Date().toISOString().split('T')[0], // Today
      p_attendees: params.attendees ?? 1,
      p_booking_notes: params.booking_notes ?? null
    })

    if (error) {
      console.error('Booking error:', error)
      return { error: error.message }
    }

    return { data }
  } catch (err) {
    console.error('Unexpected booking error:', err)
    return { error: 'An unexpected error occurred' }
  }
}

// =============================================================================
// BOOKING AVAILABILITY CHECK
// =============================================================================

export interface AvailabilityParams {
  court_id: string
  start_time: string // Format: "HH:MM:SS"
  end_time: string   // Format: "HH:MM:SS"
  booking_date?: string // Format: "YYYY-MM-DD"
}

export interface AvailabilityResult {
  court: {
    id: string
    name: string
    club_id: string
    hourly_rate: number
    court_type: string
  }
  requested_date: string
  requested_start: string
  requested_end: string
  is_available: boolean
  overlapping_bookings: Array<{
    id: string
    booking_date: string
    start_time: string
    end_time: string
    status: string
    user_id: string
  }>
}

/**
 * Check if a specific time slot is available
 */
export async function checkAvailability(params: AvailabilityParams): Promise<{
  data?: AvailabilityResult
  error?: string
}> {
  try {
    const { data, error } = await supabase.rpc('check_booking_availability', {
      p_court_id: params.court_id,
      p_start_time: params.start_time,
      p_end_time: params.end_time,
      p_booking_date: params.booking_date ?? new Date().toISOString().split('T')[0]
    })

    if (error) {
      console.error('Availability check error:', error)
      return { error: error.message }
    }

    return { data }
  } catch (err) {
    console.error('Unexpected availability error:', err)
    return { error: 'An unexpected error occurred' }
  }
}

// =============================================================================
// GET USER BOOKINGS
// =============================================================================

export interface UserBookingsParams {
  start_date?: string // Format: "YYYY-MM-DD"
  end_date?: string   // Format: "YYYY-MM-DD"
}

export interface UserBooking {
  id: string
  club_id: string
  club_name: string
  court_id: string
  court_name: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
  total_cost: number
  payment_status: string
  attendees: number
}

/**
 * Get all bookings for the current user within a date range
 */
export async function getUserBookings(params: UserBookingsParams = {}): Promise<{
  data?: UserBooking[]
  error?: string
}> {
  try {
    const { data, error } = await supabase.rpc('get_user_bookings', {
      p_start_date: params.start_date ?? new Date().toISOString().split('T')[0],
      p_end_date: params.end_date ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
    })

    if (error) {
      console.error('Get bookings error:', error)
      return { error: error.message }
    }

    return { data }
  } catch (err) {
    console.error('Unexpected get bookings error:', err)
    return { error: 'An unexpected error occurred' }
  }
}

// =============================================================================
// CANCEL BOOKING
// =============================================================================

export interface CancelBookingParams {
  booking_id: string
  cancellation_reason?: string
}

/**
 * Cancel a booking (user can cancel their own, club admin can cancel any)
 */
export async function cancelBooking(params: CancelBookingParams): Promise<{
  data?: BookingResult
  error?: string
}> {
  try {
    const { data, error } = await supabase.rpc('cancel_booking', {
      p_booking_id: params.booking_id,
      p_cancellation_reason: params.cancellation_reason ?? 'User requested cancellation'
    })

    if (error) {
      console.error('Cancel booking error:', error)
      return { error: error.message }
    }

    return { data }
  } catch (err) {
    console.error('Unexpected cancel booking error:', err)
    return { error: 'An unexpected error occurred' }
  }
}

// =============================================================================
// PRACTICAL USAGE EXAMPLES
// =============================================================================

/**
 * Example: Complete booking flow
 */
export async function exampleBookingFlow() {
  // 1. First check availability
  const availability = await checkAvailability({
    court_id: 'court-uuid-here',
    start_time: '09:00:00',
    end_time: '10:00:00'
  })

  if (availability.error) {
    console.error('Availability check failed:', availability.error)
    return
  }

  if (!availability.data?.is_available) {
    console.log('Time slot not available')
    console.log('Overlapping bookings:', availability.data?.overlapping_bookings)
    return
  }

  // 2. Create the booking atomically
  const booking = await createBooking({
    club_id: 'club-uuid-here',
    court_id: 'court-uuid-here',
    start_time: '09:00:00',
    end_time: '10:00:00',
    total_price: 50.00,
    attendees: 2,
    booking_notes: 'Morning game with friends'
  })

  if (booking.error) {
    console.error('Booking failed:', booking.error)
    return
  }

  console.log('Booking created successfully:', booking.data)
}

/**
 * Example: Server Action for Next.js App Router
 */
export async function createBookingServerAction(formData: FormData) {
  'use server'

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const clubId = formData.get('clubId') as string
  const courtId = formData.get('courtId') as string
  const startTime = formData.get('startTime') as string
  const endTime = formData.get('endTime') as string
  const totalPrice = parseFloat(formData.get('totalPrice') as string)

  // Create booking
  const result = await createBooking({
    club_id: clubId,
    court_id: courtId,
    start_time: startTime,
    end_time: endTime,
    total_price: totalPrice
  })

  if (result.error) {
    return { success: false, error: result.error }
  }

  return { success: true, booking: result.data }
}

// =============================================================================
// ERROR HANDLING EXAMPLES
// =============================================================================

/**
 * Example: Handling common booking errors
 */
export async function robustBookingExample(params: CreateBookingParams) {
  try {
    const result = await createBooking(params)
    
    if (result.error) {
      // Handle specific error types
      if (result.error.includes('Time slot unavailable')) {
        return { 
          type: 'unavailable',
          message: 'This time slot is already booked. Please choose another time.',
          suggestions: 'Try the next available slot or check for cancellations.'
        }
      } else if (result.error.includes('Club not found or access denied')) {
        return { 
          type: 'access_denied',
          message: 'You do not have permission to book at this club.',
          suggestions: 'Please contact the club administrator.'
        }
      } else if (result.error.includes('Court not found or inactive')) {
        return { 
          type: 'invalid_court',
          message: 'The selected court is not available.',
          suggestions: 'Please select a different court.'
        }
      } else if (result.error.includes('Start time must be before end time')) {
        return { 
          type: 'invalid_time',
          message: 'Invalid time range selected.',
          suggestions: 'End time must be after start time.'
        }
      } else {
        return { 
          type: 'unknown_error',
          message: 'Booking failed: ' + result.error,
          suggestions: 'Please try again or contact support if the problem persists.'
        }
      }
    }

    return { 
      type: 'success',
      booking: result.data 
    }
    
  } catch (err) {
    console.error('Unexpected error:', err)
    return { 
      type: 'system_error',
      message: 'System error occurred. Please try again.',
      suggestions: 'If this problem persists, please contact support.'
    }
  }
}

/**
 * Example: React hook pattern (for use in React components)
 * 
 * Usage in React component:
 * 
 * ```tsx
 * function BookingComponent() {
 *   const [state, setState] = useState<{
 *     isLoading: boolean
 *     booking?: BookingResult
 *     error?: string
 *   }>({ isLoading: false })
 * 
 *   const handleBooking = async (bookingData: CreateBookingParams) => {
 *     setState({ isLoading: true })
 *     
 *     const result = await createBooking(bookingData)
 *     
 *     setState({
 *       isLoading: false,
 *       booking: result.data,
 *       error: result.error
 *     })
 *   }
 * 
 *   return (
 *     <div>
 *       {state.error && <div className="error">Error: {state.error}</div>}
 *       {state.booking && <div>Booking confirmed! ID: {state.booking.id}</div>}
 *       <button onClick={() => handleBooking(/* params */)} disabled={state.isLoading}>
 *         {state.isLoading ? 'Booking...' : 'Book Court'}
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export async function handleBookingAsync(
  params: CreateBookingParams,
  onSuccess: (booking: BookingResult) => void,
  onError: (error: string) => void
) {
  const result = await createBooking(params)
  
  if (result.data) {
    onSuccess(result.data)
  } else if (result.error) {
    onError(result.error)
  }
}

// =============================================================================
// SIMPLE BOOKING FUNCTION (One-liner for basic usage)
// =============================================================================

/**
 * Simple booking function for basic use cases
 * @param clubId - The club ID
 * @param courtId - The court ID  
 * @param startTime - Start time in HH:MM:SS format
 * @param endTime - End time in HH:MM:SS format
 * @param price - Total price for the booking
 * @returns Booking result or error
 */
export async function bookCourt(
  clubId: string,
  courtId: string,
  startTime: string,
  endTime: string,
  price: number
): Promise<{ success: boolean; booking?: BookingResult; error?: string }> {
  const result = await createBooking({
    club_id: clubId,
    court_id: courtId,
    start_time: startTime,
    end_time: endTime,
    total_price: price
  })

  if (result.error) {
    return { success: false, error: result.error }
  }

  return { success: true, booking: result.data }
}

// =============================================================================
// USAGE NOTES
// =============================================================================

/**
 * IMPORTANT NOTES FOR PRODUCTION:
 * 
 * 1. Always use server-side rendering or server actions for booking creation
 * 2. Never expose the create_atomic_booking function to client-side code
 * 3. Implement proper authentication checks in your UI
 * 4. Add rate limiting to prevent spam bookings
 * 5. Log all booking attempts for audit purposes
 * 6. Implement proper payment processing integration
 * 7. Add email/SMS confirmations for successful bookings
 * 8. Consider implementing booking holds (temporary reservations)
 * 9. Add automatic cleanup of cancelled bookings
 * 10. Monitor for unusual booking patterns (potential abuse)
 * 
 * ERROR CODES REFERENCE:
 * - "Start time must be before end time" = Invalid time range
 * - "Club not found or access denied" = User doesn't have permission
 * - "Court not found or inactive" = Court doesn't exist or is disabled
 * - "User not found" = User session expired or invalid
 * - "Time slot unavailable - overlapping booking exists" = Race condition prevented
 * - "Not authorized to cancel this booking" = Insufficient permissions
 * 
 * EXAMPLE USAGE PATTERNS:
 * 
 * 1. Server Action:
 * ```tsx
 * export async function bookingAction(formData: FormData) {
 *   const result = await createBookingServerAction(formData)
 *   return result
 * }
 * ```
 * 
 * 2. Direct Library Usage:
 * ```tsx
 * const result = await createBooking({
 *   club_id: 'uuid',
 *   court_id: 'uuid', 
 *   start_time: '09:00:00',
 *   end_time: '10:00:00',
 *   total_price: 50.00
 * })
 * ```
 * 
 * 3. Simple Booking:
 * ```tsx
 * const result = await bookCourt(
 *   'club-uuid',
 *   'court-uuid',
 *   '09:00:00',
 *   '10:00:00', 
 *   50.00
 * )
 * ```
 */
