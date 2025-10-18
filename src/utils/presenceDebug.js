/**
 * Presence Debug Utility
 * Add this to help diagnose presence issues
 */

import { ref, set, onValue } from 'firebase/database';
import { rtdb } from './firebase';

export async function testPresenceConnection() {
  console.log('🔍 Testing Firebase Realtime Database connection...');
  
  try {
    // Test 1: Check if rtdb is initialized
    console.log('✓ RTDB object exists:', !!rtdb);
    console.log('📍 RTDB app name:', rtdb.app.name);
    
    // Test 2: Try to write test data
    const testRef = ref(rtdb, 'test/connection');
    console.log('📝 Attempting to write test data...');
    
    await set(testRef, {
      timestamp: Date.now(),
      message: 'Connection test'
    });
    
    console.log('✅ Write successful!');
    
    // Test 3: Try to read data
    console.log('📖 Attempting to read data...');
    
    const presenceRef = ref(rtdb, 'presence');
    onValue(presenceRef, (snapshot) => {
      console.log('📊 Presence data:', snapshot.val());
      console.log('👥 Number of users online:', snapshot.size);
      
      // Debug: Show each user's color
      snapshot.forEach((child) => {
        const data = child.val();
        console.log(`🎨 User: ${data.displayName} → Color: ${data.colorHex}`);
      });
    }, (error) => {
      console.error('❌ Read error:', error);
    });
    
    console.log('✅ Listener attached successfully!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

