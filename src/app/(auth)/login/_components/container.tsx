import Illustration from "./illustration";
import LoginForm from "./login-form";

export default function Container() {
    return (
        <div className="min-h-screen flex">
            <Illustration />

            <LoginForm />
        </div>
    )
}