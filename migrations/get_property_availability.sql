-- Get Property Availability Function
-- Returns availability for a property over a date range
-- Excludes sensitive booking information from public users

CREATE OR REPLACE FUNCTION get_property_availability(
    property_id UUID,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    date DATE,
    is_available BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    property_record RECORD;
    booking_record RECORD;
    block_record RECORD;
    current_check_date DATE;
    is_blocked BOOLEAN;
BEGIN
    -- Validate input dates
    IF start_date IS NULL OR end_date IS NULL OR start_date >= end_date THEN
        RAISE EXCEPTION 'Invalid date range provided';
    END IF;

    -- Check if property exists and is not deleted
    SELECT
        "MinStayDays",
        "MaxStayDays",
        "LeadTimeDays",
        "BufferDays"
    INTO property_record
    FROM "EstateProperties"
    WHERE "Id" = property_id
        AND "IsDeleted" = false;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Property not found';
    END IF;

    -- Generate date series and check availability for each date
    current_check_date := start_date;

    WHILE current_check_date < end_date LOOP
        is_blocked := false;

        -- Check against bookings (confirmed, pending, cancelled)
        FOR booking_record IN
            SELECT "CheckInDate", "CheckOutDate"
            FROM "Bookings"
            WHERE "EstatePropertyId" = property_id
                AND "IsDeleted" = false
                AND "Status" IN (0, 1, 2) -- Pending, Confirmed, Cancelled
                AND current_check_date >= "CheckInDate"
                AND current_check_date < "CheckOutDate"
        LOOP
            is_blocked := true;
            EXIT;
        END LOOP;

        -- If not blocked by booking, check availability blocks
        IF NOT is_blocked THEN
            FOR block_record IN
                SELECT "StartDate", "EndDate", "IsAvailable"
                FROM "AvailabilityBlocks"
                WHERE "EstatePropertyId" = property_id
                    AND "IsDeleted" = false
                    AND "IsAvailable" = false -- Only check blocking entries
                    AND current_check_date >= "StartDate"::date
                    AND current_check_date < "EndDate"::date
            LOOP
                is_blocked := true;
                EXIT;
            END LOOP;
        END IF;

        -- Apply lead time rule (earliest bookable date)
        IF property_record."LeadTimeDays" IS NOT NULL
           AND current_check_date < (CURRENT_DATE + INTERVAL '1 day' * property_record."LeadTimeDays") THEN
            is_blocked := true;
        END IF;

        -- Apply buffer days rule (days required between bookings)
        -- Note: This is a simplified implementation - in practice you might need more complex logic
        -- to ensure buffer days between existing bookings

        -- Return result for this date
        RETURN QUERY SELECT current_check_date, NOT is_blocked;

        -- Move to next date
        current_check_date := current_check_date + INTERVAL '1 day';
    END LOOP;

    RETURN;
END;
$$;