import React from "react";
import { Grid } from "@chakra-ui/react";
import { TextNote } from "@/models/TextNote";
import NoteItem from "./NoteItem";

interface NotesGridProps {
  notes: TextNote[];
  handleDeleteNote: (docId: string) => Promise<void>;
  handleUpdateNote: (
    docId: string,
    values: { text: string; title: string }
  ) => Promise<void>;
}

const NotesGrid: React.FC<NotesGridProps> = ({
  notes,
  handleDeleteNote,
  handleUpdateNote,
}) => {
  return (
    <Grid
      w="100%"
      templateColumns={{
        base: "repeat(1, 1fr)",
        md: "repeat(2, 1fr)",
        xl: "repeat(3, 1fr)",
      }}
      gap={5}
      p={4}
    >
      {notes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          handleDeleteNote={handleDeleteNote}
          handleUpdateNote={handleUpdateNote}
        />
      ))}
    </Grid>
  );
};

export default NotesGrid;
