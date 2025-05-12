const axios2 = require('axios')


const BACKEND_URL = "https://futo-emerald-world.onrender.com"
  
const axios = {
    post: async (...args) => {
        try {
            const res = await axios2.post(...args);
            return res;
        } catch(e) {
            return e.response;
        }
    }, 

    get: async (...args) => {
        try {
            const res = await axios2.get(...args);
            return res;
        } catch(e) {
            return e.response;
        }
    },

    put: async (...args) => {
        try {
            const res = await axios2.put(...args);
            return res;
        } catch(e) {
            return e.response;
        }
    },

    delete: async (...args) => {
        try {
            const res = await axios2.delete(...args);
            return res;
        } catch(e) {
            return e.response;
        }
    }  
}

describe("Authorization", () => {
    //Possible Error that axios posts an error when 400 status code
    //to fix, put try and catch block, to test the error

    test("User is able to successfully signup as an Admin only once", async () => {
        const username = `futabandit-${Math.random()}`;
        const password = "futabandit";

        const response = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "Admin",
        })

        expect(response.status).toBe(200);
        // expect(response.data).toHaveProperty(userId);

        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "Admin",
        })
        
        expect(updatedResponse.status).toBe(400);
    })

    test("User is able to successfully signup as an User only once", async () => {
        const username = `futabandit-${Math.random()}`;
        const password = "futabandit";

        const response = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "User",
        })

       

        expect(response.status).toBe(200);
        // expect(response.data).toHaveProperty(userId);

        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "User",
        })
        
        expect(updatedResponse.status).toBe(400);
    })

    test("User is not able to signup if any of the field is missing", async () => {
        const username = `futabandit-${Math.random()}`;
        const password = "";

        const response = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "Admin",
        })

        expect(response.status).toBe(400);
    })
    
    test("User receives a token not undefined when he signs up", async () => {
        const username = `futabandit-${Math.random()}`;
        const password = "futabandit";

        const response = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "Admin",
        })
        expect(response.status).toBe(200);
        expect(response.data.token).toBeDefined();
    })

    test("User is able to successfully log in after a sign up", async () => {
        const username = `futabandit-${Math.random()}`;
        const password = "futabandit";

        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "Admin",
        })

        const loginResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, {
            username,
            password,
        })

        expect(loginResponse.status).toBe(200);
    })

    test("User is able to successfully log in as a User after a sign up", async () => {
        const username = `futabandit-${Math.random()}`;
        const password = "futabandit";

        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "User",
        })

        const loginResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, {
            username,
            password,
        })

        expect(loginResponse.status).toBe(200);
    })

    test("User is not able to log in with wrong credentials after a sign up", async () => {
        const username = `futabandit-${Math.random()}`;
        const password = "futabandit";

        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "Admin",
        })

        const loginResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, {
            username,
            password : "fafa",
        })

        expect(loginResponse.status).toBe(400);
    })

    test("User receives a token upon successful log in after a sign up", async () => {
        const username = `futabandit-${Math.random()}`;
        const password = "futabandit";

        const signUpResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/signup`, {
            username,
            password,
            type: "Admin",
        })

        const loginResponse = await axios.post(`${BACKEND_URL}/api/v1/auth/login`, {
            username,
            password 
        })

        expect(loginResponse.data.token).toBeDefined();
    })

});