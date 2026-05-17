import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { gsap } from 'gsap';

declare const Snap: any;
declare const mina: any;

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
  standalone: true,
  imports: [RouterModule]
})
export class IntroComponent implements OnInit, AfterViewInit, OnDestroy {
  tempoRestante = 5; // Segundos de duração da intro
  private timerId: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inicia o timer regressivo para ir ao Login único unificado
    this.timerId = setInterval(() => {
      this.tempoRestante--;
      if (this.tempoRestante <= 0) {
        clearInterval(this.timerId);
        // Encaminha automaticamente para a rota de autenticação unificada do sistema
        this.router.navigate(['/home']);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    // Evita vazamento de memória limpando o timer ao destruir o componente
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  ngAfterViewInit(): void {
    const master = gsap.timeline({ delay: 1.2 });

    const studentWhole = '#stud_whole';
    const head = '#stud_head';
    const eyes = '.eye';
    const reflection = '.reflection';
    const hair = '#hair';
    const body = '#stud_body';
    const pageFold = '#pgFld';
    const stars = '.stars';
    const circle = '.circle';
    const dashed = '#dashed';

    const s = Snap('#student');
    const bottomPages = s.select('#btm_pgs');
    const bottomEdge = s.select('#bk_edg');
    const bottomBody = s.select('#bk_bdy');
    const bottomRight = s.select('#btm_r');
    const bottomLeft = s.select('#btm_l');
    const line = s.select('#line');

    const bookIn = () => {
      bottomPages.animate({ points: "199,174 200,305 200,304 199,174 190,174 190,333 209,333 209,174" }, 350, mina.easeInOut, () => {
        setTimeout(() => {
          bottomPages.animate({ points: "313.061,304.975 200.188,305 198.801,305 85.44,304.975 30.5,333 190,333 209,333 370,333" }, 1000, mina.bounce);
        }, 350);
      });

      bottomEdge.animate({ d: "M184.5,169l0.5,172.5c0,0,5.635,7,14.661,7s14.839-7,14.839-7V169" }, 350, mina.easeInOut, () => {
        setTimeout(() => {
          bottomEdge.animate({ d: "M13,341.5h172.224c0,0,5.973,7,15,7s14.776-7,14.776-7h172" }, 1000, mina.bounce);
        }, 350);
      });

      bottomBody.animate({ d: "M205.94,174L200,307l-7.524-133l-8.602,0.26L184.512,338 c0,0,0.044,0.473,0.138,0.637c0.779,1.371,4.964,7.938,15.35,7.938c10.182,0,14.449-6.029,15.356-7.561 c0.13-0.219,0.191-0.299,0.191-0.299L216.212,174H205.94z" }, 350, mina.easeInOut, () => {
        setTimeout(() => {
          bottomBody.animate({ d: "M328.178,308.28L200,307.238L72.591,308.28 l-60.046,30.913l171.995-0.196c0,0,0.016,0.49,0.11,0.654c0.779,1.371,4.964,6.932,15.35,6.932 c10.182,0,14.449-6.033,15.356-7.564c0.13-0.219,0.191-0.063,0.191-0.063L387.241,339L328.178,308.28z" }, 1000, mina.bounce);
        }, 350);
      });

      bottomRight.animate({ points: "199,299 199.016,174 199.7,174 199,326" }, 350, mina.easeInOut, () => {
        setTimeout(() => {
          bottomRight.animate({ points: "199,299 300.647,299 355.376,326 199,326" }, 1000, mina.bounce);
        }, 350);
      });

      bottomLeft.animate({ points: "199,299 199.016,174 198.359,173.984 199,326" }, 350, mina.easeInOut, () => {
        setTimeout(() => {
          line.attr({ opacity: 1 });
          bottomLeft.animate({ points: "199,299 96,299 44,326 199,326" }, 1000, mina.bounce);
        }, 350);
      });
    };

    const circleScale = () => {
      const tl = gsap.timeline();
      tl.from(circle, { duration: 0.7, transformOrigin: "50% 100%", scale: 0, ease: "back.out", stagger: 0.2 }, 'cirlceIn')
        .from(stars, { duration: 1, transformOrigin: "50% 50%", scale: 0, opacity: 0, ease: "elastic.out", stagger: 0.1 }, 'cirlceIn+=0.5');
      return tl;
    };

const bodyRotateIn = () => {
      const tl = gsap.timeline();
      tl.from(studentWhole, { duration: 0.5, rotation: 90, transformOrigin: "106 260", scale: 0, fillOpacity: 0.5 }, 'bodyRotation')
        .from(head, { duration: 0.5, rotation: 45, transformOrigin: "85 180", ease: "back.out" }, "bodyRotation+=0.35")
        .from(hair, { duration: 2, rotation: 15, transformOrigin: "10 50%", ease: "elastic.out" }, "bodyRotation+=0.37")
        .set([pageFold, line], { opacity: 1 }, "bodyRotation+=1.5"); 
      
      tl.timeScale(1.5);
      return tl;
    };

    const repeatAnim = () => {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to(eyes, { duration: 0.1, rotationX: 90, transformOrigin: "50% 50%" }, 'repeatStart')
        .to(eyes, { duration: 0.1, rotationX: 0 })
        .to(eyes, { duration: 3, rotationX: 0 })
        .to(eyes, { duration: 0.1, rotationX: 90, transformOrigin: "50% 50%" })
        .to(eyes, { duration: 0.1, rotationX: 0 })
        .to(eyes, { duration: 0.1, rotationX: 90, transformOrigin: "50% 50%" })
        .to(eyes, { duration: 0.1, rotationX: 0 })
        .to(eyes, { duration: 4, rotationX: 0 })
        .to(eyes, { duration: 0.1, rotationX: 90, transformOrigin: "50% 50%" })
        .to(eyes, { duration: 0.1, rotationX: 0 })
        .to(eyes, { duration: 3, rotationX: 0 })
        .to(reflection, { duration: 1.5, x: 12, opacity: 0.15 }, 'repeatStart+=1')
        .to(reflection, { duration: 4, x: 12, opacity: 0.35 }, 2.5)
        .to(reflection, { duration: 1, x: 0, opacity: 0.1 }, 4)
        .to(reflection, { duration: 4, x: 0, opacity: 0.15 })
        .to(dashed, { duration: 15, rotation: 180, transformOrigin: "50% 50%", ease: "none" }, 'repeatStart');
      return tl;
    };

   gsap.set([studentWhole, stars, circle], { display: 'block' });
    master.add(circleScale())
          .addLabel('circleEnd')
          .add(bodyRotateIn(), 'circleEnd-=1.25')
          .call(bookIn, [], 'circleEnd-=1') 
          .add(repeatAnim(), 'circleEnd-=1');
  }
}