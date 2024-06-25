import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import nlp from 'compromise';

const EmailList = () => {
  const [emails, setEmails] = useState([]);
  const [emailInfo, setEmailInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const accessToken = sessionStorage.getItem('accessToken');
  const [response, setResponse] = useState(null);

  const handleClick = async (id) => {
    try {
      const res = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const emailData = res.data;
      setEmailInfo(emailData);
      // performAnalysis(emailData); 
    } catch (error) {
      console.log(error);
      setEmailInfo(null);
      // setResponse(null);
    }
  };


  // function to get Openai response

  const performAnalysis = async (emailData) => {
    try {
      let body = '';

      if (emailData.payload.parts) {
        // Find the first part that contains text/plain or text/html content
        const textPart = emailData.payload.parts.find(part =>
          part.mimeType === 'text/plain' || part.mimeType === 'text/html'
        );

        if (textPart && textPart.body && textPart.body.data) {
          body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        }
      } else if (emailData.payload.body && emailData.payload.body.data) {
        // If payload.parts is empty, use the main body data
        body = atob(emailData.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }

      const res = await axios.post('http://localhost:5000/analyze-email', { body });
      setResponse(res.data.analysis);
    } catch (error) {
      console.log(error);
      setResponse('Error performing analysis');
    }
  };



  const handleLogout = () => {
    sessionStorage.removeItem('accessToken');
    navigate('/');
  };

  
  const getHeader = (headers, name) => {
    const header = headers.find(header => header.name === name);
    return header ? header.value : 'N/A';
  };

  const analyzeEmailContent = (content) => {
    const doc = nlp(content);
    const people = doc.people().out('array');
    const places = doc.places().out('array');
    const organizations = doc.organizations().out('array');

    return {
      people,
      places,
      organizations,
    };
  };

  
  let body = '';
  if (emailInfo?.payload?.parts) {
    // Find the first part containing text/plain or text/html content
    const textPart = emailInfo.payload.parts.find(part =>
      part.mimeType === 'text/plain'  || part.mimeType === 'text/html'
    );

    if (textPart && textPart.body && textPart.body.data) {
      body = atob(textPart.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
  } else if (emailInfo?.payload?.body && emailInfo?.payload?.body?.data) {
    body = atob(emailInfo.payload.body.data.replace(/-/g, '+').replace(/_/g, '/')); // If payload.parts is empty, use the main body data
  }
  
  const analysis = body ? analyzeEmailContent(body) : null;
  
  const getEmails = async () =>{
    try {
      const res = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      setEmails(res.data.messages)
      setLoading(false)
    } catch (error) {
      setError('Error fetching emails');
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) {
      getEmails();
    }
  }, [accessToken]);
  
  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  
  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Emails</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
          >
            Logout
          </button>
        </div>
        <ul className="divide-y">
          {emails.map(email => (
            <li key={email.id}
              onClick={() => handleClick(email.id)}
              className="p-4 cursor-pointer hover:bg-gray-100">
              {email.id}
            </li>
          ))}
        </ul>
      </div>
      <div className="w-2/3 p-6">
        {emailInfo ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">Email Analysis</h2>
            <p className="mb-2"><strong>From:</strong> {getHeader(emailInfo.payload.headers, 'From')}</p>
            <p className="mb-2"><strong>To:</strong> {getHeader(emailInfo.payload.headers, 'To')}</p>
            <p className="mb-2"><strong>Date:</strong> {getHeader(emailInfo.payload.headers, 'Date')}</p>
            <p className="mb-4"><strong>Subject:</strong> {getHeader(emailInfo.payload.headers, 'Subject')}</p>
            <p className="mb-4"><strong>Snippet:</strong> {emailInfo.snippet}</p>
            {/* <p className="mb-4"><strong>Email Content:</strong> {body}</p> */}
            {/* {response && (
              <div>
                <h3 className="text-xl font-bold mb-2">Response</h3>
                <p className="mb-4">{response}</p>
              </div>
            )}  */}
            <div>
              <p className="mb-2"><strong>People:</strong> {analysis?.people.join(', ') || 'N/A'}</p>
              <p className="mb-2"><strong>Places:</strong> {analysis?.places.join(', ') || 'N/A'}</p>
              <p className="mb-2"><strong>Organizations:</strong> {analysis?.organizations.join(', ') || 'N/A'}</p>
            </div>
          </div>


        ) : (
          <p className="text-gray-500">Select an email to view its details</p>
        )}
      </div>
    </div>
  );
};

export default EmailList;