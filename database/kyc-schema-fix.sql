-- Fix KYC table schema: increase documentRef and remarks to handle large JSON payloads
-- Run this after updating the entity mapping.

IF OBJECT_ID('dbo.kyc', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.kyc', 'documentRef') IS NOT NULL
    BEGIN
        ALTER TABLE dbo.kyc
        ALTER COLUMN documentRef nvarchar(max) NULL;
        PRINT 'documentRef updated to nvarchar(max)';
    END

    IF COL_LENGTH('dbo.kyc', 'remarks') IS NOT NULL
    BEGIN
        ALTER TABLE dbo.kyc
        ALTER COLUMN remarks nvarchar(max) NULL;
        PRINT 'remarks updated to nvarchar(max)';
    END
END
ELSE
BEGIN
    PRINT 'kyc table not found';
END
