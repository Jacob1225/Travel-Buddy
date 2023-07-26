import ClipLoader from "react-spinners/ClipLoader";
import { CSSProperties } from "react";


export default function Spinner({color, loading}: {color: string, loading: boolean}) {
    
    const override: CSSProperties = {
        display: "block",
        margin: "250px auto", 
    }; 

    return (
        <ClipLoader
            color={color}
            loading={loading}
            cssOverride={override}
            size={100}
            aria-label="Loading Spinner"
            data-testid="loader"
      />
    )
}