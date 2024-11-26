Project Information
Project Name: Recipe Management RESTful API
Group No:54
Group member:
LI Wing On       StudentID:12886461
CHENG Kwing To  StudentID:12889278
KAM Sum Kai     StudentID:12886203
YIP Tin Hang      StudentID:13258976

Project File Introduction
This project consists of the following key files and folders:
server.js
Purpose: The server.js file is the core of the application, responsible for:
Setting up the Express server and middleware.
Configuring Facebook OAuth authentication using Passport.js.
Defining RESTful API routes for managing recipes (Create, Read, Update, Delete).
Establishing a connection to the MongoDB database.
Handling session management and form data processing.

Functionalities:
Facebook Authentication:
Configured using passport-facebook strategy.
facebookAuth object contains:
clientID: Your Facebook App Client ID.
clientSecret: Your Facebook App Client Secret.
callbackURL: The URL for Facebook to redirect after successful login.
Moved sensitive data to environment variables (FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, CALLBACK_URL).

MongoDB Connection:
Connects to MongoDB using the mongodb library.
The mongourl variable holds the MongoDB connection string.
MongoDB URL is now stored in an environment variable (MONGO_URI) for security.
RESTful API Endpoints:
POST /api/recipe/:recipeid: Create a new recipe.
GET /api/recipe/:recipeid: Retrieve a specific recipe by ID.
PUT /api/recipe/:recipeid: Update an existing recipe.
DELETE /api/recipe/:recipeid: Delete a recipe.
Web Application Routes:
login: Login page for Facebook authentication.
/list: Displays a list of all recipes.
/details: Shows details of a selected recipe.
/create: Recipe creation page.
/edit: Recipe editing page.
/delete: Recipe deletion endpoint.

package.json
Purpose: Defines the project’s dependencies, scripts, and metadata.
Key Dependencies:
express: For building the server and routing.
passport: For authentication handling.
passport-facebook: For Facebook OAuth integration.
mongodb: For database interactions.
express-formidable: For handling form data and file uploads.
ejs: For rendering server-side templates.
express-session: For session management during user authentication
Dev Dependencies:
nodemon: For automatically restarting the server during development when file changes are detected.
Scripts:
start: Starts the application using node server.js.

views (folder)
Purpose: Contains EJS templates for rendering the web-based frontend of the application.
Included Files:
login.ejs: The login page for authenticating users.
list.ejs: Displays a list of recipes.
details.ejs: Shows details of a selected recipe.
edit.ejs: Provides a form for editing existing recipes.
create.ejs: Provides a form for creating a new recipe.
message.ejs: A generic template for displaying messages (e.g., success or error).

Cloud URL : https://nodejs-curd-group51.onrender.com/


Operation guides
Te use of Login/Logout pages:
Valid Login Information:

You must use a valid Facebook account to log in.
The Facebook authentication credentials (clientID, clientSecret, and callbackURL) used for logging in have been updated in the server.js file.
Sign-In Steps:
Open the login page at: localhost:8099/login
Click on the "Continue with Facebook" button.
Log in using your Facebook account credentials.
Upon successful authentication, you will be redirected to the Recipe List page (/list), displaying all available recipes.
Sign-Out Steps:
Navigate to any page in the application.
Click on the "Logout" button in the navigation menu.
You will be redirected back to the Login Page (/login), and your session will be terminated.

Operation Guide for CRUD Web Pages
Create
Purpose: Allows users to create a new recipe.
UI Element:
Navigate to the Create Recipe page by clicking the "Create New Recipe" button on the navigation bar or home page.
Fill in the recipe form fields:
Title: Recipe name.
Category: Select the type of recipe (e.g., Dessert, Main Course).
Cuisine Type: Specify the cuisine (e.g., Italian, French).
Preparation Time: Time required to prepare the recipe.
Ingredients: List the ingredients.
Instructions: Step-by-step instructions.
Optional: Upload a recipe image.
Click the Submit button to save the recipe.
Result: Redirects to the Recipe List page with the new recipe added.

Read
Purpose: View a list of recipes or details of a specific recipe.
UI Elements:
Recipe List Page:
Displays all available recipes in a tabular or card format.
Each recipe has a Details button.
Details Page:
Click the Details button next to a recipe to view its full information, including title, category, cuisine type, preparation time, ingredients, instructions, and image (if available).

Update
Purpose: Edit an existing recipe's details.
UI Element:
On the Details Page, click the Edit button to navigate to the Edit Recipe page.
Update the desired fields in the form (e.g., change title, update ingredients, or modify instructions).
Click the Submit button to save changes.
Result: Redirects back to the Recipe Details page with updated information.

Delete
Purpose: Remove a recipe from the database.
UI Element:
On the Details Page, click the Delete button.
A confirmation dialog may appear to confirm the action.
Once confirmed, the recipe is deleted.
Result: Redirects to the Recipe List page, with the deleted recipe no longer visible.

RESTful CRUD Services:Create,Read,Update,Delete
HTTP Request Types:POST,GET,PUT,DELETE
The list of APIS: Create , Read, Update, Delete
Path URI: /api/recipe/:recipeid
Test using curl:
Create: curl -X POST http://localhost:8099/api/recipe/12345 \-F "recipeid=12345" \-F "title=Simple Salad" \-F "category=Salad" \-F "cuisine_type=Vegetarian" \-F "preparation_time=10 mins" \-F "ingredients=Lettuce, Tomatoes, Cucumbers" \-F "instructions=Chop ingredients and mix in a bowl"
Description: This creates a new recipe with the ID 12345.
Read:curl -X GET http://localhost:8099/api/recipe/12345 
Description: This retrieves the recipe with the ID 12345.

Update:curl -X PUT http://localhost:8099/api/recipe/12345 \-F "title=Updated Salad Recipe" \-F "category=Healthy Salad" \-F "cuisine_type=Vegetarian" \-F "preparation_time=15 mins" \-F "ingredients=Lettuce, Tomatoes, Cucumbers, Olives" \-F "instructions=Chop ingredients, mix in a bowl, and add dressing" 
Description: This updates the recipe with the ID 12345.
Delete:curl -X DELETE http://localhost:8099/api/recipe/12345 
Description: This deletes the recipe with the ID 12345.
