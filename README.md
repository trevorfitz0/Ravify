<h1 align=center>Ravify</h1>

## Abstract
Ravify is a react Application which is centralized around the spotify for devs API. The main goal of this Application is to first log a user in using their spotify account then grab their top artist data from all time. Once the Artist data is retrived the application lets the user choose between 1 of 3 backdrops for their lineup then places their favortie artists in a festival lineup style on top of the backdrop.
## Project Viewing
Unfortunately, since the app uses Secret API Keys through Spotify's API, it's unable to be pulled down and run locally unless I give you the API keys. 

The project can be viewed at this link! https://ravify.vercel.app/
I have submitted the project to become public through the Spotify API, currently you can only log in using 2 accounts, (Mine and a friends for testing). If you would like to see the site in action you can use the cypress tests as mentioned below or you can ask me to show you. Sadly this Extension Requests process can take up to 6 weeks so hopefully I can get it done a little quicker!

A Spotify Account with a history of music listening is REQUIRED to run this application, if you would like to see the app's functionality without one you can use the cypress tests.

<details>
<summary> <h2>Preview</h2> </summary>
<br>

Home Page
<img width="1423" alt="Screenshot 2023-04-21 at 12 58 41 AM" src="https://user-images.githubusercontent.com/57536985/233563653-160557e7-1603-49b5-8b6a-1111520aee5c.png">


Backdrop Selection
<img width="1423" alt="Screenshot 2023-04-21 at 12 59 25 AM" src="https://user-images.githubusercontent.com/57536985/233563776-bb7d4a43-d7d1-4a36-b193-e0f3e1ee3bf6.png">


Lineup display page
<img width="1422" alt="Screenshot 2023-04-21 at 1 00 01 AM" src="https://user-images.githubusercontent.com/57536985/233563883-a08cfe13-5c14-4e75-bf65-277cf22cfb62.png">


</details>


## Context
This application is my Mod 3 Final solo project, and I worked on it for roughly 20 hours.

## Learning Goals
- Learn how to use the spotify API
- Challenge my css skills with organizing lots of elements in a small place
- Create a multi-page UX utilizing React Router.

## Wins + Challenges
- Creating a very good looking festival lineup that is easily accessable for every spotify user
- A large challenge was Spotify's authentication, it takes about 4 rounds of API fetch's to get to the point where I have a users data
- One large challenge I am still working on is figuring out how to download the festival lineup as a PNG. I have found solutions but the way I wrote my code is making it a lot harder, I will maybe try converting the final product to a canvas to fix this issue.
