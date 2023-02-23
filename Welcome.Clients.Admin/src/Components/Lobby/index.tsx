import React from 'react';
import { Button, FormControl, FormGroup, Grid, Paper, TextField } from '@mui/material';
import { useState } from 'react';
import { User } from '../classes';
import StyledButton from '../Buttons';

type Props = {
  signInAgent: (agent: User) => void;
};

const Lobby = ({ signInAgent }: Props) => {
  const [user, setUser] = useState<string>('');
  const [providerId, setProviderId] = useState<string>('');
  const [memberId, setMemberId] = useState<string>('');
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  return (
    <Grid container direction="column" justifyContent="center" alignItems="center">
      <Grid item xs={6}>
        <Paper elevation={2} sx={{ padding: '40px' }}>
          <form
            className="lobby"
            onSubmit={(e) => {
              e.preventDefault();
              setButtonDisabled(true);
              const u = new User(
                memberId,
                user,
                providerId,
                user === 'Bill Gates'
                  ? 'https://images.english.elpais.com/resizer/-RJqSifj2gWMdKtFKyZiMCttn6M=/414x311/cloudfront-eu-central-1.images.arcpublishing.com/prisa/F34R4EEJ2RG3DKUGSVKBLC2GXA.jpeg'
                  : user === 'Sara Conor'
                  ? 'https://i.pinimg.com/originals/e7/4d/b4/e74db4ea1abeb82d7fec86207abd0679.jpg'
                  : 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/MiB.svg/800px-MiB.svg.png'
              );
              u.phone = '+4219401564983';
              u.email = 'rod.ropholelston@gmailc.com';

              signInAgent(u);
            }}>
            <FormGroup>
              <FormControl margin="dense">
                <TextField size="small" placeholder="Agent Name" label="name" variant="outlined" onChange={(e) => setUser(e.target.value)} />
              </FormControl>
              <FormControl margin="normal">
                <TextField size="small" placeholder="Provider Id" label="provider id" variant="outlined" onChange={(e) => setProviderId(e.target.value)} />
              </FormControl>
              <FormControl margin="normal">
                <TextField size="small" placeholder="Member Id" label="member id" variant="outlined" onChange={(e) => setMemberId(e.target.value)} />
              </FormControl>
            </FormGroup>

            <br></br>
            <Button variant="contained" size="large" fullWidth type="submit" disabled={!user && !providerId && !memberId && buttonDisabled}>
              Join
            </Button>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Lobby;
