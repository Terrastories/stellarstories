import React, { PureComponent } from "react";

class IntroPopup extends PureComponent {

  constructor(props){
    super(props);
    this.state = { 
      isPopped: true,
    }
  }

  handleIntroPopup = () => {
    this.setState(prevState =>({
      isPopped: !prevState.isPopped
    }));
  }

  render(){
    return(
      <div className={this.state.isPopped ? 'intro-card isShown' : 'intro-card isHidden'}>
        <h2>Introduction</h2>
        <h3>What is Stellarstories?</h3>
        <p>Stellarstories is a proposed extension of Terrastories, an open-source geostorytelling application for mapping place-based oral histories. This is a proof of concept to show how it can be extended for storytelling about the cosmos. The stories are made up using ChatGPT. <a href="https://github.com/terrastories/stellarstories" target="_blank" rel="noreferrer">Learn more about Stellarstories here.</a></p>

        <div className="intro-card--actions">
          <span className="count" onClick={this.handleIntroPopup}>Close</span>
        </div>
      </div>
    );
  }

}

export default IntroPopup;
