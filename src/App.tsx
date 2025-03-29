import { useState } from "react";

function App() {
  const [id, setId] = useState("");
  const [recommendations, setRecommendations] = useState<{
    collaborative: string[];
    content: string[];
    azureML: string[];
  } | null>(null);

  const handleGetRecommendations = () => {
    // THIS IS WHERE WE WILL WRITE LOGIC TO CALL THE ML API (OR USE PREBUILT CSV FILES)
    // for now we will just use dummy data
    const collaborative = ["item1", "item2", "item3", "item4", "item5"];
    const content = ["item6", "item7", "item8", "item9", "item10"];
    const azureML = ["item11", "item12", "item13", "item14", "item15"];

    setRecommendations({ collaborative, content, azureML });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Recommendation System</h1>
      <div>
        <label htmlFor="idInput">Enter UserID or ItemID:</label>
        <input
          id="idInput"
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          style={{ marginLeft: "10px" }}
        />
        <button
          onClick={handleGetRecommendations}
          style={{ marginLeft: "10px" }}
        >
          Get Recommendations
        </button>
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
