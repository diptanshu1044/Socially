#!/usr/bin/env node

/**
 * Script to clean up old notifications (older than 1 month)
 * This can be run as a cron job or scheduled task
 * 
 * Usage:
 * - Manual: node scripts/cleanup-notifications.js
 * - Cron: 0 2 * * * node /path/to/scripts/cleanup-notifications.js
 */

const https = require('https');
const http = require('http');

// Configuration
const CLEANUP_URL = process.env.CLEANUP_URL || 'http://localhost:3000/api/notifications/cleanup';
const CLEANUP_SECRET = process.env.CLEANUP_SECRET || 'your-secret-key';

async function cleanupNotifications() {
  return new Promise((resolve, reject) => {
    const url = new URL(CLEANUP_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLEANUP_SECRET}`,
        'User-Agent': 'Notification-Cleanup-Script/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log(`✅ Cleanup successful: ${response.message}`);
            console.log(`📊 Deleted ${response.deletedCount} old notifications`);
            resolve(response);
          } else {
            console.error(`❌ Cleanup failed: ${response.error}`);
            reject(new Error(response.error));
          }
        } catch (error) {
          console.error('❌ Failed to parse response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Main execution
async function main() {
  try {
    console.log('🔄 Starting notification cleanup...');
    console.log(`📍 Target URL: ${CLEANUP_URL}`);
    
    const result = await cleanupNotifications();
    
    console.log('✅ Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { cleanupNotifications }; 