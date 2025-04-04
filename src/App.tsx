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

// Interface for dropdown options
interface DropdownOption {
  value: string;
  label: string;
}

function App() {
  const [id, setId] = useState("");
  const [idType, setIdType] = useState<"userId" | "contentId">("userId");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [collaborativeData, setCollaborativeData] = useState<CollaborativeRecommendation[]>([]);
  const [contentData, setContentData] = useState<ContentRecommendation[]>([]);
  const [userIdOptions, setUserIdOptions] = useState<DropdownOption[]>([]);
  const [contentIdOptions, setContentIdOptions] = useState<DropdownOption[]>([]);
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
        const collaborativeResponse = await fetch('/article_recommendations_collaborative.csv');
        const collaborativeText = await collaborativeResponse.text();
        const collaborativeRows = collaborativeText.split('\n');
        
        // The new CSV has different column names
        const collaborativeData: CollaborativeRecommendation[] = [];
        const userIds: Set<string> = new Set();
        
        for (let i = 1; i < collaborativeRows.length; i++) {
          if (collaborativeRows[i].trim() === '') continue;
          
          // The CSV might have commas within the text, so we need to be careful with splitting
          // For simplicity, we'll use a simple split and handle potential issues
          const values = collaborativeRows[i].split(',');
          
          if (values.length >= 6) {
            // Map the values to our expected format
            // "If you liked" becomes userId, and "Recommendation X" becomes itemX
            const row: CollaborativeRecommendation = {
              userId: values[0], // "If you liked" column
              item1: values[1],  // "Recommendation 1" column
              item2: values[2],  // "Recommendation 2" column
              item3: values[3],  // "Recommendation 3" column
              item4: values[4],  // "Recommendation 4" column
              item5: values[5],  // "Recommendation 5" column
            };
            
            collaborativeData.push(row);
            userIds.add(values[0]);
          }
        }
        setCollaborativeData(collaborativeData);
        
        // Create dropdown options for userIds
        const userIdOpts = Array.from(userIds).map(id => ({
          value: id,
          label: id
        }));
        setUserIdOptions(userIdOpts);

        // Load content filtering recommendations
        const contentResponse = await fetch('/recommendations.csv');
        const contentText = await contentResponse.text();
        const contentRows = contentText.split('\n');
        
        const contentData: ContentRecommendation[] = [];
        const contentIds: Set<string> = new Set();
        
        for (let i = 1; i < contentRows.length; i++) {
          if (contentRows[i].trim() === '') continue;
          
          const values = contentRows[i].split(',');
          
          if (values.length >= 6) {
            // Map the values to our expected format
            // "Title" becomes contentId, and "Recommendation X" becomes itemX
            const row: ContentRecommendation = {
              contentId: values[0], // "Title" column
              item1: values[1],     // "Recommendation 1" column
              item2: values[2],     // "Recommendation 2" column
              item3: values[3],     // "Recommendation 3" column
              item4: values[4],     // "Recommendation 4" column
              item5: values[5],     // "Recommendation 5" column
            };
            
            contentData.push(row);
            contentIds.add(values[0]);
          }
        }
        setContentData(contentData);
        
        // Create dropdown options for contentIds
        const contentIdOpts = Array.from(contentIds).map(id => ({
          value: id,
          label: id
        }));
        setContentIdOptions(contentIdOpts);
      } catch (error) {
        console.error('Error loading CSV data:', error);
        setError('Failed to load recommendation data');
      }
    };

    loadCSVData();
  }, []);

  // This function simulates calling the Azure ML endpoint
  // In a real-world scenario, this would be a server-side API call to avoid CORS issues
  const getAzureMLRecommendations = (userId: string): string[] => {
    // For demonstration purposes, we're returning recommendations from the content data
    // This simulates what an Azure ML endpoint might return
    if (contentData.length > 0) {
      // Get a random content recommendation to use as Azure ML recommendations
      // We'll use a different random index to ensure variety
      const randomIndex = Math.floor(Math.random() * Math.min(contentData.length, 10));
      const randomContent = contentData[randomIndex];
      
      // Filter out any empty recommendations and ensure we have exactly 5
      const recommendations = [
        randomContent.item1,
        randomContent.item2,
        randomContent.item3,
        randomContent.item4,
        randomContent.item5
      ].filter(item => item && item.trim() !== "");
      
      // If we have fewer than 5 valid recommendations, add some generic ones
      while (recommendations.length < 5) {
        recommendations.push(`Azure ML Recommendation ${recommendations.length + 1}`);
      }
      
      // Return exactly 5 recommendations
      return recommendations.slice(0, 5);
    }
    
    // Fallback if no content data is available
    return [
      "Azure ML Recommendation 1",
      "Azure ML Recommendation 2",
      "Azure ML Recommendation 3",
      "Azure ML Recommendation 4",
      "Azure ML Recommendation 5"
    ];
  };

  // Helper function to ensure we have exactly 5 valid recommendations
  const normalizeRecommendations = (recommendations: string[]): string[] => {
    // Filter out any empty recommendations
    const validRecs = recommendations.filter(item => item && item.trim() !== "");
    
    // If we have fewer than 5 valid recommendations, add some generic ones
    const result = [...validRecs];
    while (result.length < 5) {
      result.push(`Recommendation ${result.length + 1}`);
    }
    
    // Return exactly 5 recommendations
    return result.slice(0, 5);
  };

  const handleGetRecommendations = async () => {
    if (!id.trim()) {
      setError("Please enter or select an ID");
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
        // For content ID, find a relevant collaborative recommendation
        // We'll use the first few collaborative recommendations for variety
        if (collaborativeData.length > 0) {
          // Get a random set of collaborative recommendations
          const randomIndices = Array.from({ length: 5 }, () => 
            Math.floor(Math.random() * Math.min(collaborativeData.length, 20))
          );
          
          collaborative = randomIndices.map(index => {
            const rec = collaborativeData[index];
            return rec.item1; // Just use the first recommendation from each set
          });
        } else {
          collaborative = ["No collaborative recommendations available"];
        }
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
        // If user ID is provided, find a random content recommendation
        if (contentData.length > 0) {
          const randomIndex = Math.floor(Math.random() * contentData.length);
          const randomContent = contentData[randomIndex];
          content = [
            randomContent.item1,
            randomContent.item2,
            randomContent.item3,
            randomContent.item4,
            randomContent.item5
          ];
        } else {
          content = ["No content recommendations available"];
        }
      }

      // Get Azure ML recommendations
      const azureML = getAzureMLRecommendations(id);

      // Normalize all recommendations to ensure we have exactly 5 valid items for each
      setRecommendations({
        collaborative: normalizeRecommendations(collaborative),
        content: normalizeRecommendations(content),
        azureML: normalizeRecommendations(azureML)
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setError('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  // Define styles for a more professional look
  const styles = {
    container: {
      padding: "30px",
      maxWidth: "1200px",
      margin: "0 auto",
      fontFamily: "Arial, sans-serif",
      color: "#333",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
    },
    header: {
      color: "#2c3e50",
      borderBottom: "2px solid #3498db",
      paddingBottom: "10px",
      marginBottom: "25px"
    },
    section: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "6px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      marginBottom: "20px"
    },
    formGroup: {
      marginBottom: "15px"
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "bold",
      color: "#2c3e50"
    },
    radioGroup: {
      display: "flex",
      gap: "15px",
      marginBottom: "15px"
    },
    radioLabel: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer"
    },
    select: {
      padding: "10px",
      borderRadius: "4px",
      border: "1px solid #ddd",
      width: "100%",
      fontSize: "16px"
    },
    input: {
      padding: "10px",
      borderRadius: "4px",
      border: "1px solid #ddd",
      width: "100%",
      fontSize: "16px",
      marginBottom: "10px"
    },
    button: {
      backgroundColor: "#3498db",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      transition: "background-color 0.3s"
    },
    buttonHover: {
      backgroundColor: "#2980b9"
    },
    error: {
      color: "#e74c3c",
      marginTop: "10px",
      padding: "10px",
      backgroundColor: "#fadbd8",
      borderRadius: "4px"
    },
    resultsContainer: {
      marginTop: "30px"
    },
    resultsHeader: {
      color: "#2c3e50",
      borderBottom: "2px solid #3498db",
      paddingBottom: "10px",
      marginBottom: "20px"
    },
    recommendationSection: {
      backgroundColor: "#fff",
      padding: "20px",
      borderRadius: "6px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      marginBottom: "20px"
    },
    recommendationHeader: {
      color: "#2c3e50",
      borderBottom: "1px solid #eee",
      paddingBottom: "8px",
      marginBottom: "15px"
    },
    recommendationList: {
      listStyleType: "none",
      padding: 0
    },
    recommendationItem: {
      padding: "10px",
      borderBottom: "1px solid #f0f0f0",
      fontSize: "15px"
    },
    recommendationItemAlternate: {
      backgroundColor: "#f8f9fa"
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Article Recommendation System</h1>
      
      <div style={styles.section}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Select Recommendation Type:</label>
          <div style={styles.radioGroup}>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="idType"
                value="userId"
                checked={idType === "userId"}
                onChange={() => {
                  setIdType("userId");
                  setId(""); // Clear the input when switching types
                }}
                style={{ marginRight: "8px" }}
              />
              User ID (Article-based)
            </label>
            <label style={styles.radioLabel}>
              <input
                type="radio"
                name="idType"
                value="contentId"
                checked={idType === "contentId"}
                onChange={() => {
                  setIdType("contentId");
                  setId(""); // Clear the input when switching types
                }}
                style={{ marginRight: "8px" }}
              />
              Content ID (Article-based)
            </label>
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <label htmlFor="idSelect" style={styles.label}>
            Select {idType === "userId" ? "Article (User ID)" : "Article (Content ID)"}:
          </label>
          <select
            id="idSelect"
            value={id}
            onChange={(e) => setId(e.target.value)}
            style={styles.select}
          >
            <option value="">-- Select an article --</option>
            {idType === "userId" 
              ? userIdOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              : contentIdOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
            }
          </select>
        </div>
        
        <div style={styles.formGroup}>
          <label htmlFor="idInput" style={styles.label}>
            Or enter {idType === "userId" ? "Article title (User ID)" : "Article title (Content ID)"}:
          </label>
          <input
            id="idInput"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            style={styles.input}
            placeholder={`Enter an article title`}
          />
          
          <button
            onClick={handleGetRecommendations}
            style={styles.button}
            disabled={loading}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor;
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = styles.button.backgroundColor;
            }}
          >
            {loading ? "Loading..." : "Get Recommendations"}
          </button>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
      </div>
      
      {recommendations && (
        <div style={styles.resultsContainer}>
          <h2 style={styles.resultsHeader}>Recommended Articles</h2>
          
          <div style={styles.recommendationSection}>
            <h3 style={styles.recommendationHeader}>Collaborative Filtering Recommendations</h3>
            <ul style={styles.recommendationList}>
              {recommendations.collaborative.map((item, index) => (
                <li 
                  key={item} 
                  style={{
                    ...styles.recommendationItem,
                    ...(index % 2 === 1 ? styles.recommendationItemAlternate : {})
                  }}
                >
                  {index + 1}. {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div style={styles.recommendationSection}>
            <h3 style={styles.recommendationHeader}>Content Filtering Recommendations</h3>
            <ul style={styles.recommendationList}>
              {recommendations.content.map((item, index) => (
                <li 
                  key={item} 
                  style={{
                    ...styles.recommendationItem,
                    ...(index % 2 === 1 ? styles.recommendationItemAlternate : {})
                  }}
                >
                  {index + 1}. {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div style={styles.recommendationSection}>
            <h3 style={styles.recommendationHeader}>Azure ML Recommendations</h3>
            <ul style={styles.recommendationList}>
              {recommendations.azureML.map((item, index) => (
                <li 
                  key={item} 
                  style={{
                    ...styles.recommendationItem,
                    ...(index % 2 === 1 ? styles.recommendationItemAlternate : {})
                  }}
                >
                  {index + 1}. {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
