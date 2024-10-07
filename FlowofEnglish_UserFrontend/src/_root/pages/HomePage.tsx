import Dashboard from "@/components/Dashboard.tsx";
import Header2 from "../../components/Header2.tsx";

export const HomePage = () => {
    return (
        <div className="flex flex-1">
            <Header2/>
            <Dashboard/>
        </div>
    );
}