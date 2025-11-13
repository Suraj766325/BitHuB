clear all;
close all;
clc
%x=input('enter the first sequence:');
%h=input('enter the second sequence:');
x=[1 -1 -2 3 -1]
h=[1 2 3]
n1=length(x);
n2=length(h);
N=max(n1,n2);
x=[x zeros(1,N-n1)]; %zero-padding for x
h=[h zeros(1,N-n2)]; %zero padding for h
%%%%% Method-1(using formula)
for n=0:N-1
    y(n+1)=0;
    for i=0:N-1
        j=mod(n-i,N);
        y(n+1)=y(n+1)+x(i+1)*h(j+1);
    end
end
disp('OUTPUT BY 1ST METHOD')
y
%output
%%%%% Method-2(using matrix)
for n=1:N
    for i=1:N
    h1(i,n)=h(i);
    end
    h=circshift(h,1);
end
h1
x'
y=h1*x';
disp('OUTPUT BY 2nd METHOD')
y
%output