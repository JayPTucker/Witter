# Witter: 
![License](https://img.shields.io/badge/License-CCL-brightgreen) 
 
## 📄 Description: <a name='description'></a> 
**Updated (5/21/20):**

This is a Site that was used in order to establish a familiar level of communication with those around you in the world.  Introducing Witter; An Application that will allow you to use a Login and Registration System in Order to create a Secure Account and then be able to create "Wits" and send them out for the public world to see.  
 
## 📖 Table of Contents: 
- [Description](#description) 
- [Installation](#installation) 
- [Usage](#usage) 
- [Credits](#credits) 
- [Screenshots](#screenshots) 

 
## 🔌 Installation: <a name='installation'></a> 

**Requirements:**
- [VSCode](https://code.visualstudio.com/)
- [GitBash](https://git-scm.com/downloads)
- [NodeJS](https://nodejs.org/en/)
- [MySQL](https://dev.mysql.com/downloads/windows/installer/8.0.html)

**Installation Steps:**
1. Clone the file from the Repository
2. Put it somewhere you'll remember (Best Choice for Easy Access: In a Folder on your Desktop)
3. Open GitBash and cd directly into the directory.
- "cd desktop" -> "cd Witter" -> Done!
4. Once you're CD'd inside of the Repository, type "code ." into GitBash and hit Enter.
5. VSCode should open (Or any other Software you use to code).
6. Click on the "server.js" file and navigate to the MySQL Server Information Section which should be located near the top in the "config" folder.
7. The file is called, "config.js" and inside you'll need to edit the information so that it matches your MySQL DB. - Then copy the schema that is
in the DB folder and paste it into your Query in MySQL.
8. Next, Right click on the "server.js" and click on "Open in Terminal"
9. Once your Terminal is open type in:

> npm install

10. Wait for the Packages to install, once it's done you should now have a "node_modules" Folder to the left of your screen.
11. After that, type in "node server.js" into the terminal and hit enter to run the Application
    - If this doesn't work, you may have not Installed NodeJS or MySQL Properly OR you may have not entered in your Server information Properly.
12. Done! You should be Welcomed by a Intro Screen and once it is done loading you may now use the Application to your heart's desire.
    - All of your Wits will be locally stored and no one, but you shall see them.
 
## 💻 Usage: <a name='usage'></a> 
 
Once you go to the Website you'll be Welcomed by our Intro Screen where you have the Option to either Login or Register.  When you Press Register it will take you to our Registration page that is fairly self-explanatory.  Fill in a Username and Password and click Register; once you've done that it will securely save it to our database and encrypt your password.  Then, it'll redirect you to the Login page, once you login you'll be able to see everyone's public wits.  From there, you'll be able to type in anything you want and send it out for the world to see!
 
## 📷 Screenshots: <a name='screenshots'></a>
![Example](/public/img/example.png)

![Example2](/public/img/example2.png)

![Example3](/public/img/example3.png)

## License:
https://creativecommons.org/licenses/
