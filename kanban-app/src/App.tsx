import { useState } from "react"

function App() {

  const [columns, setColumns] = useState({
    todo: {
      name: "To Do",
      items: [
        {id: 1, content: "Item 1"},
        {id: 2, content: "Item 2"}
      ]
    },
    inProgress:{
      name: "In Progress",
      items: [
        {id: 3, content: "Item 3"},
        {id: 4, content: "Item 4"}
      ]
    },
    inReview:{
      name: "In Review",
      items: [
        {id: 5, content: "Item 5"},
        {id: 6, content: "Item 6"}
      ]
    },
    done:{
      name: "Done",
      items: [
        {id: 7, content: "Item 7"},
        {id: 8, content: "Item 8"}
      ]
    }
  });
  const [newTask, setNewTask] = useState("");
  const [activeColumns, setActiveColumns] = useState<string>("todo");
  const [draggedItem, setDraggedItem] = useState(null);

  function addNewTask(){
    if(newTask.trim() == ""){
      return;
    }

    const updatedColumns = {...columns};
    updatedColumns[activeColumns].items.push(
      {
        id: Date.now.toString(),
        content: newTask,
      }
    );

    setColumns(updatedColumns);
    setNewTask("");
  }
  return (
    <>
      <div>hello</div>
    </>
  )
}

export default App
