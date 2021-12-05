const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
  }
};
initializeDBAndServer();

/*// Returns a specific todo based on the todo ID
app.get("/todos/", async (request, response) => {
  const todoQuery = `
    SELECT
    *
    FROM
    todo
    `;
  const allTodos = await db.all(todoQuery);
  response.send(allTodos);
});*/

// 1. Returns a list of all todos whose status is 'TO DO'
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q } = request.query;
  // Returns a list of all todos whose status is 'TO DO'
  if (priority === undefined && search_q === undefined) {
    const getTodoQuery = `
    SELECT *
    FROM 
    todo
    WHERE status LIKE '${status}'`;
    const dbResponse = await db.all(getTodoQuery);
    response.send(dbResponse);
  }
  // Returns a list of all todos whose priority is 'HIGH'
  else if (status === undefined && search_q === undefined) {
    const getTodoQuery = `
    SELECT *
    FROM 
    todo
    WHERE priority LIKE '${priority}'`;
    const dbResponse = await db.all(getTodoQuery);
    response.send(dbResponse);
  }
  // Returns a list of all todos whose todo contains 'Play' text
  else if (status === undefined && priority === undefined) {
    const getTodoQuery = `
    SELECT *
    FROM 
    todo
    WHERE todo LIKE '%${search_q}%'`;
    const dbResponse = await db.all(getTodoQuery);
    response.send(dbResponse);
  }
  // Returns a list of all todos whose priority is 'HIGH' and status is 'IN PROGRESS'
  else {
    const getTodoQuery = `
    SELECT *
    FROM 
    todo
    WHERE priority LIKE '${priority}'
    AND status LIKE '${status}'`;
    const dbResponse = await db.all(getTodoQuery);
    response.send(dbResponse);
  }
});

// 2. Returns a specific todo based on the todo ID
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT 
    *
    FROM
    todo
    WHERE id = ${todoId};
    `;
  const dbResponse = await db.get(getTodoQuery);
  response.send(dbResponse);
});

// 3. Create a todo in the todo table,
app.post("/todos/", async (request, response) => {
  const createTodoDetails = request.body;
  const { id, todo, priority, status } = createTodoDetails;
  createTodoQuery = `
    INSERT INTO
    todo (id, todo, priority, status)
    VALUES (${id}, '${todo}', '${priority}', '${status}');
    `;
  const createTodo = await db.run(createTodoQuery);
  response.send("Todo Successfully Added");
});

// 4. Updates the details of a specific todo based on the todo ID
app.put("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const todoUpdateDetails = request.body;
  const { status, priority, todo } = todoUpdateDetails;
  console.log(todo);
  // UPDATE STATUS
  if (priority === undefined && todo === undefined) {
    const updateStatus = `
        UPDATE
        todo
        SET
        status = '${status}'
        WHERE id = ${todoId}`;
    await db.run(updateStatus);
    response.send("Status Updated");
  }
  // UPDATE PRIORITY
  else if (status === undefined && todo === undefined) {
    const updatePriority = `
        UPDATE
        todo
        SET
        priority = '${priority}'
        WHERE id = ${todoId}`;
    await db.run(updatePriority);
    response.send("Priority Updated");
  }
  // UPDATE TODO
  else if ((status = undefined && priority === undefined)) {
    const updateTodo = `
        UPDATE
        todo
        SET
        todo = ${todo}
        WHERE id = ${todoId}`;
    await db.run(updateTodo);
    response.send("Todo Updated");
  }
});

// 5. Deletes a todo from the todo table based on the todo ID
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `
    DELETE FROM
    todo
    WHERE id = ${todoId}`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
