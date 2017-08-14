import * as React from 'react';
import './Login.css';
import {Store} from '../store';


interface LoginProps {
  store: Store;
}

interface LoginState {
}

class Login extends React.Component<LoginProps, LoginState> {
  usernameInput: HTMLInputElement;
  passwordInput: HTMLInputElement;

  onSubmit = (ev: React.SyntheticEvent<{}>) => {
    ev.preventDefault();
    this.props.store.login(this.usernameInput.value, this.passwordInput.value);
  }

  render() {
    return (
      <div className="login">
        <form onSubmit={this.onSubmit}>
          <input name="username" placeholder="username" ref={(el) => this.usernameInput = el!}/>
          <input name="username" type="password" placeholder="password" ref={(el) => this.passwordInput = el!}/>
          <button>Login</button>
        </form>
      </div>
    );
  }
}


export default Login;