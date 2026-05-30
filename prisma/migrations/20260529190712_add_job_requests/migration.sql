-- CreateTable
CREATE TABLE "job_requests" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "estimated_price" DOUBLE PRECISION,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "assigned_to" TEXT,

    CONSTRAINT "job_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_requests_job_id_key" ON "job_requests"("job_id");

-- CreateIndex
CREATE INDEX "job_requests_service_type_status_idx" ON "job_requests"("service_type", "status");

-- CreateIndex
CREATE INDEX "job_requests_assigned_to_idx" ON "job_requests"("assigned_to");

-- AddForeignKey
ALTER TABLE "job_requests" ADD CONSTRAINT "job_requests_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "professionals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
