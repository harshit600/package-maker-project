const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Stub controller for deleting a packagemaker
const deletePackageMaker = (req, res) => {
  const { id } = req.params;
  // TODO: Add your database deletion logic here
  console.log(`Deleting packagemaker with id: ${id}`);
  res.status(200).json({ message: `Packagemaker with id ${id} deleted (stub).` });
};

// DELETE route
app.delete('/delete-packagemaker/:id', deletePackageMaker);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 