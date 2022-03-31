import { Component, OnInit, OnChanges, VERSION, ViewChild } from "@angular/core";
import { HttpService } from "../Shared/http.service";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { CKEditor4 } from 'ckeditor4-angular/ckeditor';
import { ToastrService } from "ngx-toastr";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})

export class LoginComponent implements OnInit {
  getMydate : any;
  file: string;
  public onChange( event: CKEditor4.EventInfo ) {
    console.log( event.editor.getData() );
    this.getMydate = event.editor.getData()
}
csvForm !:FormGroup;
data1:any;
  name1;
  age;
  loading = false;
  buttionText = "Submit";
@ViewChild("ckeditor") ckeditor: any;

  
  nameFormControl = new FormControl("", [
    Validators.required,
    Validators.minLength(4)
  ]);
  
  constructor(
    public http: HttpService,
    private fb:FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
    ) {
    
  }

  ngOnInit() {
    console.log(this.http.test);
    this.csvForm = this.fb.group({
      file : ['',Validators.required],
      subject :['',]
    });
  }

  onEventOrRequest()
{
this.ckeditor.instance.setData('');
}

  name = 'Angular';
  
  public model = {
      name: 'ashok',
      description: '<p>This is a sample form using CKEditor 4.</p>'
    };
  

  csvFile:Boolean=false
  activationFile: File;
  formDataActivation: FormData;
  csvResult: any[];
  nameData = 'Angular ' + VERSION.major;
  onFileUpload(event: Event) {
    this.activationFile = (event.target as HTMLInputElement).files[0];
    let arr=this.activationFile.name.split('.')[1];
    this.file = (event.target as HTMLInputElement).files[0].name;
    if (arr ==="csv") {
      this.csvFile=false
      this.formDataActivation = new FormData()
      this.formDataActivation.append('filename', this.activationFile);
      this.formDataActivation.append('document_type', 'xls');
      let reader = new FileReader();
      reader.readAsText(this.activationFile);
      reader.onload = () => {
        this.csvResult = [];
        let csv = reader.result;
        console.log(reader.result);
        let lines = csv.toString().split('\r\n');
        let headers = lines[0].split(',');
        for (let i = 1; i < lines.length; i++) {
          let obj = {};
          let currentLines = lines[i].split(',');
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLines[j];
          }
          this.csvResult.push(obj);
        }
        this.csvResult.pop();
        this.csvResult.forEach((element, i) => {
          delete element['']
          delete element["\r"]
          return element;
        });
      }
    } else {
      this.csvFile=true
    }
  }
  onSubmit(csvForm:FormGroup){
    this.spinner.show();
    let data={
      file:this.csvResult,
      subject:csvForm.value.subject,
      body:this.getMydate
    }
    this.http.sendEmail("http://localhost:3000/sendExcelFile", data).subscribe(res=>{
    if(!res){
     console.log("something went wrong");
    }else{
      console.log(res);
      this.csvForm.reset();
      this.onEventOrRequest();
      this.toastr.success('Mail has Sent Successfully');
      this.spinner.hide();
    }
     
   })

  }
  

  register() {
    this.loading = true;
    this.buttionText = "Submiting...";
    let user = {
      name: this.nameFormControl.value,
      body:this.getMydate
    }
    console.log(user);
    
    this.http.sendEmail("http://localhost:3000/sendmail", user).subscribe(
      data => {
        let res:any = data; 
        console.log(  
          ` ${user.name} is successfully register and mail has been sent and the message id is ${res.messageId}`
        );
        
      },
      err => {
        console.log(err);
        this.loading = false;
        this.buttionText = "Submit";
      },() => {
        this.loading = false;
        this.buttionText = "Submit";
      }
    );
  }
}
