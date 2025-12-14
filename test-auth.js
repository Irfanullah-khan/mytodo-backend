const axios = require('axios');

const API_URL = 'http://localhost:5001/api';

const runTests = async () => {
    try {
        console.log('--- Starting Authentication Verification ---');

        // 1. Signup User A
        const userA = {
            username: 'UserA',
            email: `usera_${Date.now()}@example.com`,
            password: 'password123',
            confirmPassword: 'password123'
        };
        console.log(`\n[1] Registering User A (${userA.email})...`);
        const signupResA = await axios.post(`${API_URL}/auth/signup`, userA);
        const tokenA = signupResA.data.token;
        console.log('✅ User A Registered. Token received.');

        // 2. Signup User B
        const userB = {
            username: 'UserB',
            email: `userb_${Date.now()}@example.com`,
            password: 'password123',
            confirmPassword: 'password123'
        };
        console.log(`\n[2] Registering User B (${userB.email})...`);
        const signupResB = await axios.post(`${API_URL}/auth/signup`, userB);
        const tokenB = signupResB.data.token;
        console.log('✅ User B Registered. Token received.');

        // 3. Create Task for User A
        console.log('\n[3] Creating Task for User A...');
        const taskA = { title: 'Task for User A' };
        await axios.post(`${API_URL}/todos`, taskA, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        console.log('✅ Task A Created.');

        // 4. Create Task for User B
        console.log('\n[4] Creating Task for User B...');
        const taskB = { title: 'Task for User B' };
        await axios.post(`${API_URL}/todos`, taskB, {
            headers: { Authorization: `Bearer ${tokenB}` }
        });
        console.log('✅ Task B Created.');

        // 5. Get Tasks for User A
        console.log('\n[5] Fetching Tasks for User A...');
        const todosA = await axios.get(`${API_URL}/todos`, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        console.log(`User A has ${todosA.data.length} tasks.`);
        if (todosA.data.length === 1 && todosA.data[0].title === taskA.title) {
            console.log('✅ User A sees ONLY their task.');
        } else {
            console.error('❌ User A sees incorrect tasks:', todosA.data);
        }

        // 6. Get Tasks for User B
        console.log('\n[6] Fetching Tasks for User B...');
        const todosB = await axios.get(`${API_URL}/todos`, {
            headers: { Authorization: `Bearer ${tokenB}` }
        });
        console.log(`User B has ${todosB.data.length} tasks.`);
        if (todosB.data.length === 1 && todosB.data[0].title === taskB.title) {
            console.log('✅ User B sees ONLY their task.');
        } else {
            console.error('❌ User B sees incorrect tasks:', todosB.data);
        }

        // 7. Unauthorized Access
        console.log('\n[7] Attempting Unauthorized Access...');
        try {
            await axios.get(`${API_URL}/todos`);
            console.error('❌ Unauthorized request succeeded (Should have failed).');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Unauthorized request correctly blocked (401).');
            } else {
                console.error('❌ Unexpected error:', error.message);
            }
        }

        console.log('\n--- Verification Complete ---');
    } catch (error) {
        console.error('❌ Verification Failed:', error.response?.data || error.message);
    }
};

runTests();
