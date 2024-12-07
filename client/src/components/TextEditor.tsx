import React, { useRef, useState } from "react";
import JoditEditor from "jodit-react";

const Editor: React.FC = () => {
  const editorRef = useRef(null);
  const [content, setContent] = useState("");

  return (
    <JoditEditor
      ref={editorRef}
      value={content}
      onChange={(newContent) => setContent(newContent)}
    />
  );
};

export default Editor;
