-- CreateTable
CREATE TABLE "Config" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    PRIMARY KEY ("key")
);

-- Add default config values
INSERT INTO
    "Config" ("key", "value", "updatedAt")
VALUES (
        'schoolName',
        'SMK Negeri 2 Malinau',
        CURRENT_TIMESTAMP
    ),
    (
        'schoolShortName',
        'SMK N

2 Malinau',
        CURRENT_TIMESTAMP
    ),
    (
        'eventTitle',
        'Pemilihan Ketua OSIS',
        CURRENT_TIMESTAMP
    ),
    (
        'eventYear',
        '2025',
        CURRENT_TIMESTAMP
    );