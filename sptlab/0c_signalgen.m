t=-2:0.01:2;
%y=[zeros(1,5),ones(1,6)];
u=(t>=0);
subplot(3,2,2);
plot(t,u);
title('Unit Step');
xlabel('t');
ylabel('u(t)');

%y=[zeros(1,5),ones(1,1),zeros(1,5)];
subplot(3,2,1);
plot(zeros(size(t)),t);
title('Unit Impulse');
xlabel('t');
ylabel('u(t)');

%y=[zeros(1,5),ones(1,6)];
x=(t.*u);
subplot(3,2,3);
plot(t,x);
title('Unit ramp');
xlabel('t');
ylabel('r(t)');

t4=0:0.01:5;
a=1;
x=exp(a*t4);
subplot(3,2,4);
plot(t4,x);
title('Exponential');
xlabel('t');
ylabel('x(t)');

t5=0:0.01:2*pi;
x=sin(t5);
subplot(3,2,5);
plot(t5,x);
title('Sine');
xlabel('t');
ylabel('x(t)');