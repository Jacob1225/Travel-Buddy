import Login from './components/Home';
export default function App() {
    
    
    // const onMouseDown = async (e: any) => {
    //     if (e.target.id === '7be036ba-e9af-4229-ba3b-6d2e3522941d'){

    //         console.log("clicked");
            // google.accounts.id.prompt(notification => {
            //     console.log(notification.getMomentType());
            //     // if (!notification.isDisplayed()) {
            //     //     console.log("prompting second time!")
            //     //     google.accounts.id.prompt();
            //     // }
            //     if (notification.isNotDisplayed () || notification.isSkippedMoment()){
            //         console.log("click"); 
                    
            //         let options: any
            //         options = {
            //             "theme": "outline",
            //             "size": "large"
            //         }
            //         google.accounts.id.renderButton(e.target!, 
            //         options)                   
            //           console.log("Google sign in not working!")
            //     }
            // });
        // }
    //}

  return (
      <Login />
  );
}
