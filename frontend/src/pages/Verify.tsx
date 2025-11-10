import {Link, useParams } from "react-router-dom";

export default function Verify() {
    const { verification_token } = useParams();
    
    async function verify(){
        await fetch(`/api/auth/verify/${verification_token}`).then( response => {
            if(!response.ok){
                //todo: error handling
            }
        })
    }
    
    verify();
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      <p className="msg flex justify-center content-end text-sm text-gray-500">
        Email successfully verified, click <Link to="/feed" className="text-[#1ec3ff] hover:underline pr-1 pl-1"> here </Link> to return to your feed.
      </p>
    </div>
  );
}
