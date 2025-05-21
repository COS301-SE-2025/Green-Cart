import { useState } from 'react';

export default function Signup() {

    return (
        <div className="signup">
            <h1>Signup</h1>
            <form>
                <div>
                    <label htmlFor="username">Name</label>
                    <input type="text" id="name" name="name" required />
                </div>
                <div>
                    <label htmlFor="email">Surname</label>
                    <input type="text" id="surname" name="surname" required />
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <div>
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input type="password" id="confirm-password" name="confirm-password" required />
                </div>
                <button type="submit">Signup</button>
            </form>
            <p>Already have an account? <a href="/login">Login</a></p>
            <p>By signing up, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
        </div>
    );
}

