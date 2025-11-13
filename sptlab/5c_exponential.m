clc;
t=-10:0.1:10;
a=1;
x=exp(a.*t);
subplot(2,2,1);
plot(t,x,'r');
xlabel('t');
ylabel('x(t)');
title("Exp. Signal");

subplot(2,2,2);
stem(t,x,'g');
xlabel('t');
ylabel('x(t)');
title("Discrete Exp. Signal");

a=-1;
x=exp(a.*t);
subplot(2,2,3);
plot(t,x,'r');
xlabel('t');
ylabel('x(t)');
title("Exp. Signal");

subplot(2,2,4);
stem(t,x,'g');
xlabel('t');
ylabel('x(t)');
title("Discrete Exp. Signal");


