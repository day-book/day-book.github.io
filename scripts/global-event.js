var GlobalEvent={listenTo:function(t,n){document.addEventListener(t,n)},trigger:function(t,n){var e=new CustomEvent(t,{detail:n});document.dispatchEvent(e)}};