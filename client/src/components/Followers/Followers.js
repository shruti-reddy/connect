import React, { Component } from "react";
import { connect } from 'react-redux';
import Card from "../Card/Card";

class Followers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      followers: [],
    };
  }

  componentDidMount() {
    const userId = this.props.match.params.id || this.props.userId;
    const requestBody = {
      query: `
      {
        users(userId: "${userId}"){
          likedby {
            count
            likes {
              _id
              userName
              city
              country
              liked {
                count
              }
              likedby {
                count
              }
              photos(isMain: true) {
                url
              }
            }
          }
        }
      }
      `,
    };

    fetch("/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.data.users[0].likedby.count) {
          this.setState({ followers: data.data.users[0].likedby.likes });
        }
      });
  }

  render() {
    return (
      <div>
        {this.state.followers.map((user, index) => (
          <Card key={index} user={user} />
        ))}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.auth.user.userId
  }
}

export default connect(mapStateToProps)(Followers);
