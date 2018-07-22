import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { auth } from 'firebase/app';
import { CalendarEvent } from 'angular-calendar';
import { DayType } from '../../interfaces/interfaces';


@Injectable()
export class FirebaseService {

  horarios: AngularFireList<any>;

  daysTypes:AngularFireList<any>;

  authState: any = null;
    
  constructor( private firebaseDatabase:AngularFireDatabase, private firebaseAuth:AngularFireAuth ) { 
    this.firebaseAuth.authState.subscribe((auth) => {
      this.authState = auth;
      
    });
    
  }

  //Authentification

  // Returns true if user is logged in
   authenticated(): boolean {
    return this.authState !== null;
  }

  // Returns current user data
  currentUser(): any {
    return this.authenticated ? this.authState : null;
  }

  // Returns
  currentUserObservable(): any{
    return this.firebaseAuth.authState
  }

  // Returns current user UID
  currentUserId(): string {
    return this.authenticated ? this.authState.uid : '';
  }

  // Anonymous User
  currentUserAnonymous(): boolean {
    return this.authenticated ? this.authState.isAnonymous : false
  }

  // Returns current user display name or Guest
  currentUserDisplayName(): string {
    if (!this.authState) { return 'Guest' }
    else if (this.currentUserAnonymous) { return 'Anonymous' }
    else { return this.authState['displayName'] || 'User without a Name' }
  }

  googleLogin() {
    const provider = new auth.GoogleAuthProvider();
    return this.socialSignIn(provider);
  }

  private socialSignIn(provider) {
    return this.firebaseAuth.auth.signInWithPopup(provider)
      .then((credential) =>  {
          this.authState = credential.user
      })
      .catch(error => console.log(error));
  }

  useremailLogin(credentials:any){
    return this.firebaseAuth.auth.signInWithEmailAndPassword(credentials.email,credentials.password)
      .then((credential) =>  {
        this.authState = credential.user
    })
    .catch(error => console.log(error));;
  }

 //// Sign Out ////
  signOut(): void {
    
    this.firebaseAuth.auth.signOut();
    
  }

  pushId(){
    return this.firebaseDatabase.createPushId();
  }

  //DataBase
  getHorarios(){
    return this.horarios = this.firebaseDatabase.list('horarios');
  }

        
  addHorario( horario:CalendarEvent):Promise<any>{
    horario.meta.id = this.firebaseDatabase.createPushId();
    let newHorario = JSON.stringify(horario);
    return this.horarios.set(horario.meta.id,JSON.parse(newHorario));
    
  }

  updateHorario(horario:CalendarEvent):Promise<any>{
    let newHorario = JSON.stringify(horario);
    return this.horarios.set(horario.meta.id,JSON.parse(newHorario));
  }

  deleteHorario(horario:CalendarEvent){
    this.horarios.remove(horario.meta.id);
  }

  getDayTypes(){
    return this.daysTypes = this.firebaseDatabase.list('tipos-dia');
  }

  addDayType(date:Date,typeDay:DayType){
      return this.daysTypes.set(date.toDateString(),typeDay);
  }
  
}
