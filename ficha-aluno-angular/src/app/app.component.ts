import { Component } from '@angular/core';
import { Ficha, Experience, Education, Skill } from './ficha';
import { ScriptService } from './script.service';
declare let pdfMake: any ;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  ficha = new Ficha();

  degrees = ['Ensino Fundamental', 'Ensino Médio', 'Superior', 'Mestrado', 'Doutorado'];

  constructor(private scriptService: ScriptService) {
    this.ficha = JSON.parse(sessionStorage.getItem('ficha')) || new Ficha();
    if (!this.ficha.experiences || this.ficha.experiences.length === 0) {
      this.ficha.experiences = [];
      this.ficha.experiences.push(new Experience());
    }
    if (!this.ficha.educations || this.ficha.educations.length === 0) {
      this.ficha.educations = [];
      this.ficha.educations.push(new Education());
    }
    if (!this.ficha.skills || this.ficha.skills.length === 0) {
      this.ficha.skills = [];
      this.ficha.skills.push(new Skill());
    }

    console.log('Loading External Scripts');
    this.scriptService.load('pdfMake', 'vfsFonts');
  }

  addExperience() {
    this.ficha.experiences.push(new Experience());
  }

  addEducation() {
    this.ficha.educations.push(new Education());
  }

  generatePdf(action = 'open') {
    console.log(pdfMake);
    const documentDefinition = this.getDocumentDefinition();

    switch (action) {
      case 'open': pdfMake.createPdf(documentDefinition).open(); break;
      case 'print': pdfMake.createPdf(documentDefinition).print(); break;
      case 'download': pdfMake.createPdf(documentDefinition).download(); break;

      default: pdfMake.createPdf(documentDefinition).open(); break;
    }

  }


  resetForm() {
    this.ficha = new Ficha();
  }

  getDocumentDefinition() {
    sessionStorage.setItem('ficha', JSON.stringify(this.ficha));
    return {
      content: [
        {
          text: 'RESUME',
          bold: true,
          fontSize: 20,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        {
          columns: [
            [{
              text: this.ficha.name,
              style: 'name'
            },
            {
              text: this.ficha.address
            },
            {
              text: this.ficha.cidade
            },
            {
              text: 'Email : ' + this.ficha.email,
            },
            {
              text: 'Contant No : ' + this.ficha.contactNo,
            },
            {
              text: 'GitHub: ' + this.ficha.socialProfile,
              link: this.ficha.socialProfile,
              color: 'blue',
            }
            ],
            [
              this.getProfilePicObject()
            ]
          ]
        },
        {
          text: 'Skills',
          style: 'header'
        },
        {
          columns : [
            {
              ul : [
                ...this.ficha.skills.filter((value, index) => index % 3 === 0).map(s => s.value)
              ]
            },
            {
              ul : [
                ...this.ficha.skills.filter((value, index) => index % 3 === 1).map(s => s.value)
              ]
            },
            {
              ul : [
                ...this.ficha.skills.filter((value, index) => index % 3 === 2).map(s => s.value)
              ]
            }
          ]
        },
        {
          text: 'Experience',
          style: 'header'
        },
        this.getExperienceObject(this.ficha.experiences),

        {
          text: 'Education',
          style: 'header'
        },
        this.getEducationObject(this.ficha.educations),
        {
          text: 'Other Details',
          style: 'header'
        },
        {
          text: this.ficha.otherDetails
        },
        {
          text: 'Signature',
          style: 'sign'
        },
        {
          columns : [
              { qr: this.ficha.name + ', Contact No : ' + this.ficha.contactNo, fit : 100 },
              {
              text: `(${this.ficha.name})`,
              alignment: 'right',
              }
          ]
        }
      ],
      info: {
        title: this.ficha.name + '_RESUME',
        author: this.ficha.name,
        subject: 'RESUME',
        keywords: 'RESUME, ONLINE RESUME',
      },
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 20, 0, 10],
            decoration: 'underline'
          },
          name: {
            fontSize: 16,
            bold: true
          },
          jobTitle: {
            fontSize: 14,
            bold: true,
            italics: true
          },
          sign: {
            margin: [0, 50, 0, 10],
            alignment: 'right',
            italics: true
          },
          tableHeader: {
            bold: true,
          }
        }
    };
  }

  getExperienceObject(experiences: Experience[]) {

    const exs = [];

    experiences.forEach(experience => {
      exs.push(
        [{
          columns: [
            [{
              text: experience.jobTitle,
              style: 'jobTitle'
            },
            {
              text: experience.employer,
            },
            {
              text: experience.jobDescription,
            }],
            {
              text: 'Experience : ' + experience.experience + ' Months',
              alignment: 'right'
            }
          ]
        }]
      );
    });

    return {
      table: {
        widths: ['*'],
        body: [
          ...exs
        ]
      }
    };
  }

  getEducationObject(educations: Education[]) {
    return {
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [{
            text: 'Degree',
            style: 'tableHeader'
          },
          {
            text: 'College',
            style: 'tableHeader'
          },
          {
            text: 'Passing Year',
            style: 'tableHeader'
          },
          {
            text: 'Result',
            style: 'tableHeader'
          },
          ],
          ...educations.map(ed => {
            return [ed.degree, ed.college, ed.passingYear, ed.percentage];
          })
        ]
      }
    };
  }

  getProfilePicObject() {
    if (this.ficha.profilePic) {
      return {
        image: this.ficha.profilePic ,
        width: 75,
        alignment : 'right'
      };
    }
    return null;
  }

  fileChanged(e) {
    const file = e.target.files[0];
    this.getBase64(file);
  }

  getBase64(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      console.log(reader.result);
      this.ficha.profilePic = reader.result as string;
    };
    reader.onerror = (error) => {
      console.log('Error: ', error);
    };
  }

  addSkill() {
    this.ficha.skills.push(new Skill());
  }

}