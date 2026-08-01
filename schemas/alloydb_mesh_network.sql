-- AlloyDB (PostgreSQL) DDL Schema for Community Mesh Network Database Layer

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE IF NOT EXISTS mesh_nodes (
    node_id VARCHAR(64) PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'DEGRADED', 'OFFLINE'
    battery_level INT CHECK (battery_level BETWEEN 0 AND 100),
    firmware_version VARCHAR(32),
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mesh_peers (
    peer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_a VARCHAR(64) REFERENCES mesh_nodes(node_id) ON DELETE CASCADE,
    node_b VARCHAR(64) REFERENCES mesh_nodes(node_id) ON DELETE CASCADE,
    rssi_dbm INT NOT NULL,
    latency_ms FLOAT NOT NULL,
    last_seen TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_peer_pair UNIQUE (node_a, node_b)
);

CREATE TABLE IF NOT EXISTS mesh_emergency_relays (
    relay_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    packet_id VARCHAR(64) NOT NULL,
    origin_node_id VARCHAR(64) REFERENCES mesh_nodes(node_id),
    hops INT NOT NULL DEFAULT 0,
    payload JSONB NOT NULL,
    relayed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mesh_nodes_status ON mesh_nodes(status);
CREATE INDEX IF NOT EXISTS idx_mesh_relays_packet ON mesh_emergency_relays(packet_id);
