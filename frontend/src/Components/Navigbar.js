import React from 'react';
import { Navbar, Nav } from 'react-bootstrap'
import { Link } from 'react-router-dom';
export default function Navigbar(props) {
    return (
        <div>
            <Navbar bg="light" expand="sm" >
                <Navbar.Brand className="mr-auto">Codechef Practice Page</Navbar.Brand>
                <Nav className="ml-auto">
                    <Nav.Item style={{ marginLeft: "20px" }}>
                        <Link to="/"> Search </Link>
                    </Nav.Item>
                    <Nav.Item style={{ marginLeft: "20px" }}>
                        <Link to="/tags/"> Tags </Link>
                    </Nav.Item>
                    {
                        (props.username !== undefined) ?
                            null :
                            (<Nav.Item style={{ marginLeft: "20px" }}>
                                <Link to="/login"> Login </Link>
                            </Nav.Item>)
                    }
                    <Nav.Item style={{ marginLeft: "20px" }}>
                        {
                            (props.username !== undefined) ?
                                (<Link to="/logout"> Logout </Link>) :
                                (<Link to="/signup" > Signup </Link>)
                        }
                    </Nav.Item>
                </Nav>
            </Navbar >
            <br />
        </div>
    )
}