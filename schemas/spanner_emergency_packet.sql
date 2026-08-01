-- Cloud Spanner DDL Schema for Billi Emergency Packet Store

CREATE TABLE EmergencyPackets (
    PacketID STRING(36) NOT NULL,
    UserID STRING(64) NOT NULL,
    Status STRING(32) NOT NULL, -- e.g., 'ACTIVE', 'RESOLVED', 'ESCALATED'
    Severity STRING(16) NOT NULL, -- e.g., 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    Latitude FLOAT64,
    Longitude FLOAT64,
    Payload BYTES(MAX),
    CreatedAt TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true),
    UpdatedAt TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true),
) PRIMARY KEY (PacketID);

CREATE INDEX IndexEmergencyPacketsByUserID ON EmergencyPackets(UserID);
CREATE INDEX IndexEmergencyPacketsByStatus ON EmergencyPackets(Status, CreatedAt DESC);

CREATE TABLE EventPackets (
    EventID STRING(36) NOT NULL,
    PacketID STRING(36) NOT NULL,
    EventType STRING(64) NOT NULL, -- e.g., 'LOCATION_UPDATE', 'AUDIO_EVIDENCE', 'SAFETY_CHECK_FAILED'
    ActorID STRING(64) NOT NULL,
    EventData JSON,
    Timestamp TIMESTAMP NOT NULL OPTIONS (allow_commit_timestamp=true),
) PRIMARY KEY (PacketID, EventID),
  INTERLEAVE IN PARENT EmergencyPackets ON DELETE CASCADE;
