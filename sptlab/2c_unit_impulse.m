t= -10:0.01:10;
x=(t==0);
subplot(2,1,1);
plot(t,x,'r');
xlabel('t');
ylabel('x(t)');
title("Unit Impulse")

subplot(2,1,2);
stem(t,x,'g');
xlabel('t');
ylabel('x(t)');
title(" Discrete Unit Impulse")
