/**
 * One-time migration: set correct practice + oem on all existing products.
 * Run once on the server: node migrate-oem.js
 *
 * Practice → OEM → Products mapping (based on actual DB contents)
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MIGRATION_MAP = [
  // ── IBM ──────────────────────────────────────────────────────────────
  { match: { product: 'Instana' },                          set: { practice: 'IBM',              oem: 'IBM' } },
  { match: { product: 'IBM Power 11' },                     set: { practice: 'IBM',              oem: 'IBM' } },

  // ── RED HAT ───────────────────────────────────────────────────────────
  { match: { product: 'Red Hat Enterprise Linux (RHEL)' },  set: { practice: 'RED HAT',          oem: 'Red Hat' } },
  { match: { product: 'Red Hat OpenShift' },                set: { practice: 'RED HAT',          oem: 'Red Hat' } },
  { match: { product: 'Red Hat OpenShift Virtualization' }, set: { practice: 'RED HAT',          oem: 'Red Hat' } },
  { match: { product: 'Red Hat Ansible Automation Platform' }, set: { practice: 'RED HAT',       oem: 'Red Hat' } },

  // ── CS-APP SECURITY ───────────────────────────────────────────────────
  { match: { product: 'ColorTokens Xshield' },              set: { practice: 'CS-APP SECURITY',  oem: 'ColorTokens' } },
  { match: { product: 'BIG-IP ADC' },                       set: { practice: 'CS-APP SECURITY',  oem: 'F5' } },

  // ── CS-FIREWALL ───────────────────────────────────────────────────────
  { match: { product: 'Check Point' },                      set: { practice: 'CS-FIREWALL',      oem: 'Check Point' } },

  // ── CS-DATA SECURITY ──────────────────────────────────────────────────
  { match: { product: 'CipherTrust' },                      set: { practice: 'CS-DATA SECURITY', oem: 'Thales' } },

  // ── DC SOLUTIONS ──────────────────────────────────────────────────────
  { match: { product: 'NetApp ONTAP ' },                    set: { practice: 'DC SOLUTIONS',     oem: 'NetApp' } },
  { match: { product: 'NetApp ONTAP' },                     set: { practice: 'DC SOLUTIONS',     oem: 'NetApp' } },
  { match: { product: 'Nutanix Cloud Platform' },           set: { practice: 'DC SOLUTIONS',     oem: 'Nutanix' } },
  { match: { product: 'Commvault Cloud Unity' },            set: { practice: 'DC SOLUTIONS',     oem: 'Commvault' } },

  // ── SERVERS ───────────────────────────────────────────────────────────
  { match: { product: 'PowerEdge' },                        set: { practice: 'SERVERS',          oem: 'Dell' } },

  // ── IT OPERATIONS ─────────────────────────────────────────────────────
  { match: { product: 'KACE SMA' },                         set: { practice: 'IT OPERATIONS',    oem: 'Quest' } },

  // ── DATABASE ──────────────────────────────────────────────────────────
  { match: { product: 'Databricks' },                       set: { practice: 'DATABASE',         oem: 'Databricks' } },
  { match: { product: 'EDB Postgres' },                     set: { practice: 'DATABASE',         oem: 'EDB' } },

  // ── AWS ───────────────────────────────────────────────────────────────
  { match: { product: 'AWS' },                              set: { practice: 'AWS',              oem: 'AWS' } },
];

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/lauren-dashboard';
  console.log('Connecting to:', uri.replace(/:\/\/.*@/, '://***@'));
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const col = db.collection('products');

  let total = 0;
  for (const rule of MIGRATION_MAP) {
    const result = await col.updateMany(
      rule.match,
      { $set: rule.set }
    );
    if (result.matchedCount > 0) {
      console.log(`  ✅ ${rule.match.product || JSON.stringify(rule.match)} → practice="${rule.set.practice}" oem="${rule.set.oem}" (${result.modifiedCount} updated)`);
      total += result.modifiedCount;
    } else {
      console.log(`  ⚠️  No match: ${rule.match.product || JSON.stringify(rule.match)}`);
    }
  }

  console.log(`\nDone. ${total} documents updated.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
