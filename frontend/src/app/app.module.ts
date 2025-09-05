import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { AngularFireModule } from '@angular/fire/compat'
import { environment } from '../environments/environment';
import { LoginComponent } from './component/login/login.component';
import { RegisterComponent } from './component/register/register.component';
import { FormsModule } from '@angular/forms';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/compat/auth';

import { ForgotPasswordComponent } from './component/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './component/verify-email/verify-email.component';
import { HomeComponent } from './component/home/home.component';
import { AboutComponent } from './component/about/about.component';
import { ContactComponent } from './component/contact/contact.component';
import { MarketHomeComponent } from './component/market-home/market-home.component';
import { MarketChartComponent } from './component/market-chart/market-chart.component';
import { Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    VerifyEmailComponent,
    AboutComponent,
    ContactComponent,
    MarketHomeComponent,
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,FormsModule,AngularFireModule.initializeApp(environment.firebase),AngularFireAuthModule,RouterLink,RouterLinkActive,RouterModule,HttpClientModule,BrowserAnimationsModule
    
  ],
  providers: [
    provideClientHydration(),
    provideFirebaseApp(() => initializeApp({"projectId":"criptomatrix-49d91","appId":"1:113544627203:web:43978a165a7ce297963a36","storageBucket":"criptomatrix-49d91.appspot.com","apiKey":"AIzaSyB_GeR7z0UC5wMRFsqxyGw7m2-S-iWoARk","authDomain":"criptomatrix-49d91.firebaseapp.com","messagingSenderId":"113544627203"})),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideMessaging(() => getMessaging())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
