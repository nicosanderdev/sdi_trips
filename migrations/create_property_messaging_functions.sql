-- Property Messaging Functions for Q&A System
-- Create these functions in your backend Supabase project

-- Function to create a new message thread for property Q&A
CREATE OR REPLACE FUNCTION create_property_message_thread(
    p_property_id UUID,
    p_user_id UUID,
    p_subject VARCHAR(255)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_member_id UUID;
    v_owner_id UUID;
    v_thread_id UUID;
BEGIN
    -- Get member ID from user ID
    SELECT "Id" INTO v_member_id
    FROM "Members"
    WHERE "UserId" = p_user_id AND "IsDeleted" = false;

    IF v_member_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Get property owner ID
    SELECT "OwnerId" INTO v_owner_id
    FROM "EstateProperties"
    WHERE "Id" = p_property_id AND "IsDeleted" = false;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Property not found';
    END IF;

    -- Check if user is not the property owner (prevent self-messaging)
    IF v_owner_id = v_member_id THEN
        RAISE EXCEPTION 'Cannot create message thread for your own property';
    END IF;

    -- Create new thread
    INSERT INTO "MessageThreads" (
        "Id",
        "Subject",
        "PropertyId",
        "CreatedAtUtc",
        "LastMessageAtUtc",
        "IsDeleted",
        "Created",
        "CreatedBy",
        "LastModified",
        "LastModifiedBy"
    ) VALUES (
        gen_random_uuid(),
        p_subject,
        p_property_id,
        NOW(),
        NOW(),
        false,
        NOW(),
        v_member_id::text,
        NOW(),
        v_member_id::text
    ) RETURNING "Id" INTO v_thread_id;

    RETURN v_thread_id;
END;
$$;

-- Function to send a property question
CREATE OR REPLACE FUNCTION send_property_question(
    p_thread_id UUID,
    p_user_id UUID,
    p_body TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_member_id UUID;
    v_property_id UUID;
    v_owner_id UUID;
    v_message_id UUID;
    v_snippet TEXT;
BEGIN
    -- Get member ID from user ID
    SELECT "Id" INTO v_member_id
    FROM "Members"
    WHERE "UserId" = p_user_id AND "IsDeleted" = false;

    IF v_member_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Validate thread exists and belongs to property
    SELECT "PropertyId" INTO v_property_id
    FROM "MessageThreads"
    WHERE "Id" = p_thread_id AND "IsDeleted" = false;

    IF v_property_id IS NULL THEN
        RAISE EXCEPTION 'Message thread not found';
    END IF;

    -- Get property owner
    SELECT "OwnerId" INTO v_owner_id
    FROM "EstateProperties"
    WHERE "Id" = v_property_id AND "IsDeleted" = false;

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Property not found';
    END IF;

    -- Check if user is not the property owner
    IF v_owner_id = v_member_id THEN
        RAISE EXCEPTION 'Cannot send question to your own property';
    END IF;

    -- Generate snippet
    SELECT generate_message_snippet(p_body, 200) INTO v_snippet;

    -- Create message
    INSERT INTO "Messages" (
        "Id",
        "ThreadId",
        "SenderId",
        "Body",
        "Snippet",
        "CreatedAtUtc",
        "InReplyToMessageId",
        "IsDeleted",
        "Created",
        "CreatedBy",
        "LastModified",
        "LastModifiedBy"
    ) VALUES (
        gen_random_uuid(),
        p_thread_id,
        v_member_id,
        p_body,
        v_snippet,
        NOW(),
        NULL,
        false,
        NOW(),
        v_member_id::text,
        NOW(),
        v_member_id::text
    ) RETURNING "Id" INTO v_message_id;

    -- Create message recipient for property owner
    INSERT INTO "MessageRecipients" (
        "Id",
        "MessageId",
        "RecipientId",
        "ReceivedAtUtc",
        "IsRead",
        "HasBeenRepliedToByRecipient",
        "IsStarred",
        "IsArchived",
        "IsDeleted",
        "Created",
        "CreatedBy",
        "LastModified",
        "LastModifiedBy"
    ) VALUES (
        gen_random_uuid(),
        v_message_id,
        v_owner_id,
        NOW(),
        false,
        false,
        false,
        false,
        false,
        NOW(),
        v_member_id::text,
        NOW(),
        v_member_id::text
    );

    -- Update thread's last message timestamp
    UPDATE "MessageThreads"
    SET "LastMessageAtUtc" = NOW(),
        "LastModified" = NOW(),
        "LastModifiedBy" = v_member_id::text
    WHERE "Id" = p_thread_id;

    RETURN v_message_id;
END;
$$;

-- Function to reply to a property message
CREATE OR REPLACE FUNCTION reply_to_property_message(
    p_message_id UUID,
    p_user_id UUID,
    p_body TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_member_id UUID;
    v_thread_id UUID;
    v_property_id UUID;
    v_original_sender_id UUID;
    v_property_owner_id UUID;
    v_reply_message_id UUID;
    v_snippet TEXT;
BEGIN
    -- Get member ID from user ID
    SELECT "Id" INTO v_member_id
    FROM "Members"
    WHERE "UserId" = p_user_id AND "IsDeleted" = false;

    IF v_member_id IS NULL THEN
        RAISE EXCEPTION 'User not authenticated';
    END IF;

    -- Get thread and property info from original message
    SELECT
        m."ThreadId",
        mt."PropertyId",
        m."SenderId"
    INTO v_thread_id, v_property_id, v_original_sender_id
    FROM "Messages" m
    JOIN "MessageThreads" mt ON mt."Id" = m."ThreadId"
    WHERE m."Id" = p_message_id
    AND m."IsDeleted" = false
    AND mt."IsDeleted" = false;

    IF v_thread_id IS NULL THEN
        RAISE EXCEPTION 'Message not found';
    END IF;

    -- Get property owner
    SELECT "OwnerId" INTO v_property_owner_id
    FROM "EstateProperties"
    WHERE "Id" = v_property_id AND "IsDeleted" = false;

    IF v_property_owner_id IS NULL THEN
        RAISE EXCEPTION 'Property not found';
    END IF;

    -- Check if user is authorized to reply (must be property owner or original sender)
    IF v_member_id != v_property_owner_id AND v_member_id != v_original_sender_id THEN
        RAISE EXCEPTION 'Not authorized to reply to this message';
    END IF;

    -- Generate snippet
    SELECT generate_message_snippet(p_body, 200) INTO v_snippet;

    -- Create reply message
    INSERT INTO "Messages" (
        "Id",
        "ThreadId",
        "SenderId",
        "Body",
        "Snippet",
        "CreatedAtUtc",
        "InReplyToMessageId",
        "IsDeleted",
        "Created",
        "CreatedBy",
        "LastModified",
        "LastModifiedBy"
    ) VALUES (
        gen_random_uuid(),
        v_thread_id,
        v_member_id,
        p_body,
        v_snippet,
        NOW(),
        p_message_id,
        false,
        NOW(),
        v_member_id::text,
        NOW(),
        v_member_id::text
    ) RETURNING "Id" INTO v_reply_message_id;

    -- Create message recipient for the other party
    INSERT INTO "MessageRecipients" (
        "Id",
        "MessageId",
        "RecipientId",
        "ReceivedAtUtc",
        "IsRead",
        "HasBeenRepliedToByRecipient",
        "IsStarred",
        "IsArchived",
        "IsDeleted",
        "Created",
        "CreatedBy",
        "LastModified",
        "LastModifiedBy"
    ) VALUES (
        gen_random_uuid(),
        v_reply_message_id,
        CASE WHEN v_member_id = v_property_owner_id THEN v_original_sender_id ELSE v_property_owner_id END,
        NOW(),
        false,
        false,
        false,
        false,
        false,
        NOW(),
        v_member_id::text,
        NOW(),
        v_member_id::text
    );

    -- Update thread's last message timestamp
    UPDATE "MessageThreads"
    SET "LastMessageAtUtc" = NOW(),
        "LastModified" = NOW(),
        "LastModifiedBy" = v_member_id::text
    WHERE "Id" = v_thread_id;

    -- Mark original message as replied to
    UPDATE "MessageRecipients"
    SET "HasBeenRepliedToByRecipient" = true,
        "LastModified" = NOW(),
        "LastModifiedBy" = v_member_id::text
    WHERE "MessageId" = p_message_id
    AND "RecipientId" = v_member_id;

    RETURN v_reply_message_id;
END;
$$;