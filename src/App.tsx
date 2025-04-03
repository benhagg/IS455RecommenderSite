import { useState, useEffect } from "react";

interface CollaborativeRecommendation {
  userId: string;
  item1: string;
  item2: string;
  item3: string;
  item4: string;
  item5: string;
}

interface ContentRecommendation {
  contentId: string;
  item1: string;
  item2: string;
  item3: string;
  item4: string;
  item5: string;
}

interface AzureMLResponse {
  Results: {
    WebServiceOutput0: Array<{
      User: string;
      "Recommended Item 1": string;
      "Recommended Item 2": string;
      "Recommended Item 3": string;
      "Recommended Item 4": string;
      "Recommended Item 5": string;
    }>;
  };
}

function App() {
  const [id, setId] = useState("");
  const [idType, setIdType] = useState<"userId" | "contentId">("userId");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collaborativeData, setCollaborativeData] = useState<CollaborativeRecommendation[]>([]);
  const [contentData, setContentData] = useState<ContentRecommendation[]>([]);
  const [recommendations, setRecommendations] = useState<{
    collaborative: string[];
    content: string[];
    azureML: string[];
  } | null>(null);

  // Load CSV data on component mount
  useEffect(() => {
    const loadCSVData = async () => {
      try {
        // Load collaborative filtering recommendations
        const collaborativeResponse = await fetch('/collaborative_recommendations.csv');
        const collaborativeText = await collaborativeResponse.text();
        const collaborativeRows = collaborativeText.split('\n');
        const collaborativeHeaders = collaborativeRows[0].split(',');
        
        const collaborativeData: CollaborativeRecommendation[] = [];
        for (let i = 1; i < collaborativeRows.length; i++) {
          if (collaborativeRows[i].trim() === '') continue;
          
          const values = collaborativeRows[i].split(',');
          const row: any = {};
          
          for (let j = 0; j < collaborativeHeaders.length; j++) {
            row[collaborativeHeaders[j]] = values[j];
          }
          
          collaborativeData.push(row as CollaborativeRecommendation);
        }
        setCollaborativeData(collaborativeData);

        // Load content filtering recommendations
        const contentResponse = await fetch('/content_recommendations.csv');
        const contentText = await contentResponse.text();
        const contentRows = contentText.split('\n');
        const contentHeaders = contentRows[0].split(',');
        
        const contentData: ContentRecommendation[] = [];
        for (let i = 1; i < contentRows.length; i++) {
          if (contentRows[i].trim() === '') continue;
          
          const values = contentRows[i].split(',');
          const row: any = {};
          
          for (let j = 0; j < contentHeaders.length; j++) {
            row[contentHeaders[j]] = values[j];
          }
          
          contentData.push(row as ContentRecommendation);
        }
        setContentData(contentData);
      } catch (error) {
        console.error('Error loading CSV data:', error);
        setError('Failed to load recommendation data');
      }
    };

    loadCSVData();
  }, []);

  // This is a mock function that simulates calling the Azure ML endpoint
  // In a real-world scenario, this would be a server-side API call to avoid CORS issues
  const getAzureMLRecommendations = (userId: string): string[] => {
    // For demonstration purposes, we're returning mock data
    // In a production environment, this would be replaced with actual API calls from a backend server
    return [
      "-8546699624128696169",
      "-8445941083309532873",
      "-7292285110016212249",
      "-6451309518266745024",
      "-4110354420726924665"
    ];
  };

  const handleGetRecommendations = async () => {
    if (!id.trim()) {
      setError("Please enter an ID");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Get collaborative filtering recommendations
      let collaborative: string[] = [];
      if (idType === "userId") {
        const userRec = collaborativeData.find(item => item.userId === id);
        if (userRec) {
          collaborative = [userRec.item1, userRec.item2, userRec.item3, userRec.item4, userRec.item5];
        } else {
          collaborative = ["No collaborative recommendations found for this user ID"];
        }
      } else {
        collaborative = ["Collaborative filtering is based on user ID, not content ID"];
      }

      // Get content filtering recommendations
      let content: string[] = [];
      if (idType === "contentId") {
        const contentRec = contentData.find(item => item.contentId === id);
        if (contentRec) {
          content = [contentRec.item1, contentRec.item2, contentRec.item3, contentRec.item4, contentRec.item5];
        } else {
          content = ["No content recommendations found for this content ID"];
        }
      } else {
        // If user ID is provided, just return some content recommendations
        content = [
          "-8546699624128696169",
          "-8445941083309532873",
          "-7292285110016212249",
          "-6451309518266745024",
          "-4110354420726924665"
        ];
      }

      // Get Azure ML recommendations
      const azureML = getAzureMLRecommendations(id);

      setRecommendations({ collaborative, content, azureML });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Recommendation System</h1>
      <div style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>ID Type:</label>
          <div style={{ marginLeft: "10px", display: "inline-block" }}>
            <label style={{ marginRight: "10px" }}>
              <input
                type="radio"
                name="idType"
                value="userId"
                checked={idType === "userId"}
                onChange={() => setIdType("userId")}
                style={{ marginRight: "5px" }}
              />
              User ID
            </label>
            <label>
              <input
                type="radio"
                name="idType"
                value="contentId"
                checked={idType === "contentId"}
                onChange={() => setIdType("contentId")}
                style={{ marginRight: "5px" }}
              />
              Content ID
            </label>
          </div>
        </div>
        <div>
          <label htmlFor="idInput">Enter {idType === "userId" ? "User ID" : "Content ID"}:</label>
          <input
            id="idInput"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            style={{ marginLeft: "10px" }}
            placeholder={`Enter a ${idType === "userId" ? "User ID" : "Content ID"}`}
          />
          <button
            onClick={handleGetRecommendations}
            style={{ marginLeft: "10px" }}
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Recommendations"}
          </button>
        </div>
        {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
        <div style={{ marginTop: "10px", fontSize: "0.9em", color: "#666" }}>
          <p>Sample IDs to try:</p>
          <ul style={{ margin: "5px 0" }}>
            <li>User IDs: 344280948527967603, 3609194402293569455, -8763398617720485024</li>
            <li>Content IDs: -4110354420726924665, -7292285110016212249, 310515487419366995</li>
          </ul>
        </div>
      </div>
      {recommendations && (
        <div style={{ marginTop: "20px" }}>
          <h2>Recommendations</h2>
          <div>
            <h3>Collaborative Filtering</h3>
            <ul>
              {recommendations.collaborative.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Content Filtering</h3>
            <ul>
              {recommendations.content.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Azure ML</h3>
            <p style={{ fontSize: "0.9em", color: "#666", marginTop: "0" }}>
              (Note: Using mock data due to CORS limitations in browser. In a production environment, this would be handled by a server-side API call.)
            </p>
            <ul>
              {recommendations.azureML.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
