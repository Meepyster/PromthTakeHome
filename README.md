### Welcome to my simple 1 month stock tracker

---

To run this project make sure you have Node.js installed and then:
* Navigate to the root folder and run: 
```bash
npm run install:all
```
* Wait for dependencies to install
* Still in the root folder run:
```bash
npm run dev
```
* ```ctrl + click``` the blue link and the frontend will open in your default browser or IDE.
>If you're on MacOS you may run into permission issues. Run these to grant access:
>```bash
>chmod +x node_modules/.bin/concurrently
>```
>```bash
>chmod +x backend/node_modules/.bin/tsx
>```
> If this does not work, delete the ```node_modules``` folder in both the root and backend and run ```npm install``` in each directory.

**NOTE**: On port 3000 you can access the API docs using ```/docs```
