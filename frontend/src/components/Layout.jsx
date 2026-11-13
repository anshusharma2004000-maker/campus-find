import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, LayoutDashboard, LogOut, Menu, PackageSearch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
export default function Layout() {
 const { user, logout } = useAuth(); const nav = useNavigate(); const [open,setOpen]=useState(false);
 const leave=()=>{logout();nav('/');setOpen(false)};
 return <><header className="topbar"><div className="navwrap"><Link to="/" className="brand"><span className="brandicon"><PackageSearch size={22}/></span>Campus<span>Find</span></Link><button className="mobile-menu" onClick={()=>setOpen(!open)}><Menu/></button><nav className={open?'navlinks show':'navlinks'}><NavLink to="/">Browse items</NavLink>{user&&<><NavLink to="/report">Report item</NavLink><NavLink to="/dashboard">My dashboard</NavLink>{user.role==='admin'&&<NavLink to="/admin">Admin</NavLink>}</>}{!user?<><Link className="nav-login" to="/login">Log in</Link><Link className="btn btn-small" to="/register">Get started</Link></>:<button className="nav-logout" onClick={leave}><LogOut size={16}/> Log out</button>}</nav></div></header><main className="main"><Outlet/></main><footer><div className="footer-inner"><div className="brand"><span className="brandicon"><PackageSearch size={20}/></span>Campus<span>Find</span></div><p>Helping campus belongings find their way home.</p><small>© {new Date().getFullYear()} CampusFind · Built for campus communities</small></div></footer></>;
}
