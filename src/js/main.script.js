// * Bootstrap libraries
import "./_bootstrap";
import ScrollSpy from 'bootstrap/js/dist/scrollspy';
import Popover from 'bootstrap/js/dist/popover';

// * Any other global site-wide JavaScript should be placed below.
(function ($, Drupal, once, Mark) {

  'use strict';

  Drupal.behaviors.bootstrap_nysa = {
    attach: function (context, settings) {
      var position = $(window).scrollTop();
      $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
          $('body').addClass("scrolled");
        }
        else {
          $('body').removeClass("scrolled");
        }
        var scroll = $(window).scrollTop();
        if (scroll > position) {
          $('body').addClass("scrolldown");
          $('body').removeClass("scrollup");
        } else {
          $('body').addClass("scrollup");
          $('body').removeClass("scrolldown");
        }
        position = scroll;
      });
      const children_elements_to_once = context.querySelectorAll('.sbf-mark-highlight');
      const context_is_element_to_once = context !== document && context.classList.contains('sbf-mark-highlight') ? context : [];
      const $element_children = once('nysa', children_elements_to_once);
      const $element_self = once('nysa', context_is_element_to_once);
      $element_children.forEach(mark);
      $element_self.forEach(mark);
        function mark(element, index) {

        let $content_to_mark = element;
        if (window.location.hash !== '') {
          var $targetAnchor = context.querySelector(window.location.hash);
          if ($targetAnchor && $content_to_mark) {
            if ($targetAnchor.type === "button") {
              // By once-ing it we won't keep hitting it.
              const $targetAnchor_once = once('nysa', $targetAnchor);
              $targetAnchor_once.forEach(function (ele) {
                ele.click();
              });
            }
          }
        }
        function extractAllText(str){
          const re = /(?:[^\s"]+|"[^"]*")+/g;
          const result = [];
          let current;
          while (current = re.exec(str)) {
            result.push(current.pop());
          }
          return result.length > 0
            ? result
            : [str];
        }

        if ($content_to_mark) {
          let params = new URLSearchParams(window.location.search.slice(1));
          const mark_source_get_param = $content_to_mark?.dataset?.sbfMarkHighlightSource ? $content_to_mark.dataset.sbfMarkHighlightSource : 'search_api_fulltext';
          console.log(params.get(mark_source_get_param));
          if (params.has(mark_source_get_param)) {
            let search_api_fulltext = params.get(mark_source_get_param);
            const pieces = extractAllText(search_api_fulltext);
            let markInstance = new Mark($content_to_mark);
            pieces.forEach((item)=> {
              const re = /"(.*?)"/g;
              const result = [];
              let current;
              while (current = re.exec(item)) {
                result.push(current.pop());
              }
              if (result.length > 0) {
                item = result[0];
              }
              markInstance.mark(item, {
                "element": "strong",
                "acrossElements": true,
                "diacritics": true,
                "separateWordSearch": false,
              });
            });
          }
        }
      };
    }
  };

  Drupal.behaviors.bootstrap_nysa_scrollspy = {
    attach: function (context, settings) {
      function SetFixedPositioning(ele) {
        let element = $(ele);
        let rect = ele.getBoundingClientRect()
        element.css("position", "");
        element.css("left","");
        element.css("top","");
        var currentOffset = element.offset();
        element.css("position", "fixed");
        element.offset(currentOffset);
        /* For some reason when the page starts already scrolled, the offset v/s the top property are all messed up */
        /* 128 here is very specific to this theme. Sorry! */
        const topCss = +element.css('top').replace('px', '')

        if (topCss <= 128 || topCss > 128) {
          element.css("top","calc(128px + var(--drupal-displace-offset-top, 0))");
        }
        element.css("width",  rect.width);
        var scrollSpyContentEl = document.querySelector('body');
        var scrollSpyInstance = ScrollSpy.getInstance(scrollSpyContentEl);
        if (scrollSpyInstance == null) {
          scrollSpyInstance = new ScrollSpy(scrollSpyContentEl);
        }
        scrollSpyInstance.refresh();
      }

      function ResetFixedPositioning(ele) {
        let element = $(ele);
        let currentFixedOffset = element.offset();
        // We want to keep the Vertical offset
        element.css("position", "");
        element.css("left","");
        element.css("top","");
        element.css("top","");
        element.css("width", "");
        var currentOffset = element.offset();
        currentOffset.top = currentFixedOffset.top;
        element.css("position", "fixed");
        element.offset(currentOffset);
        /* For some reason when the page starts already scrolled, the offset v/s the top property are all messed up */
        /* 128 here is very specific to this theme. Sorry! */
        const topCss = +element.css('top').replace('px', '')
        if (topCss <= 128 || topCss > 128) {
          element.css("top","calc(128px +var(--drupal-displace-offset-top, 0))");
        }
        var scrollSpyContentEl = document.querySelector('body');
        var scrollSpyInstance = ScrollSpy.getInstance(scrollSpyContentEl);
        if (scrollSpyInstance) {
          scrollSpyInstance.refresh();
        }
      }

      function SetAbsolutePositioning(ele) {
        const spiedOn = document.querySelector('#main-content .spied');
        const scrollspy = document.querySelector('#main-content .list-scrollspy');
        if (spiedOn && scrollspy ) {
          var scrollSpyContentEl = document.querySelector('body');
          var scrollSpyInstance = ScrollSpy.getInstance(scrollSpyContentEl);
          let Realtop = spiedOn.clientHeight - scrollspy.clientHeight;
          let Observed = document.querySelector('div[data-component-id="archipelago_subtheme_dcpl:page"] .page__header')
          let offsetRec = Observed.getBoundingClientRect()
          if (Realtop > 0) {
            let element = $(ele);
            element.css("position", "");
            element.css("left", "");
            element.css("top", "");
            element.css("position", "absolute");
            element.css("left", "");
            element.css("top",(Realtop - 128) + 'px');
            if (scrollSpyInstance) {
              scrollSpyInstance.refresh();
            }
          }
        }
        /* For some reason when the page starts already scrolled, the offset v/s the top property are all messed up */
        /* 128 here is very specific to this theme. Sorry! */
        /*const topCss = +element.css('top').replace('px', '')
        if (topCss < 128) {
          element.css("top","128px");
        } */
      }

      function UnSetFixedPositioning(ele) {
        let element = $(ele);
        element.css("position", "");
        element.css("left","");
        element.css("top","");
        element.css("width","");
      }
      /* resize needs to be aware of this offset.
               Can't be any offset.
                */
      $(once('nysa-list-scrollspy', '.list-scrollspy', context)).each(function () {
        var ele = this;
        // To make the fixed scrollspy absolute when we reach the end (imagine a scalled window)
        // or a another block after the content we are spying on
        // we will add an element just after the div.content and check intersection
        // This is extremely dependent on this theme/sites needs
        // see html.html.twig where we set up the scroll spy data elements at the body level.
        // and assumes only things inside ".content block" are spied on.
        let $content = document.querySelector('#main-content .spied');
        if ($content) {
          let trackerDiv = document.createElement("div");
          trackerDiv.setAttribute("id", "scrollspyAfter");
          $content.insertAdjacentElement('afterend', trackerDiv);
          $(window).on('resize', function () {
            if (ele.classList.contains('list-scrollspy-fixed')) {
              ResetFixedPositioning(ele);
            }
          });
        }
      });

      if ($(context).is('.view') || context === document) {
        /* Initialize Popovers */
        var popoverTriggerList = [].slice.call(context.querySelectorAll('[data-bs-toggle="popover"]'))
        var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
          return new Popover(popoverTriggerEl)
        })
      }
      $(once('attache_observer', '.page-wrapper', context))
        .each(function (index, value) {
            /* Used to keep track only once we passed the fake div we added after div.content so
            we can position absolutely the scrollspy navigation
             */
            let passtThreasHold = false;

            var observer = new IntersectionObserver(function (entries) {
              const ratio = entries[0].intersectionRatio;
              console.log(ratio);
              if (ratio < 0.1) {
                let $scrollspy = document.querySelector('.list-scrollspy');
                if ($scrollspy) {
                  if (!$scrollspy.classList.contains('list-scrollspy-fixed')) {
                    SetFixedPositioning($scrollspy);
                    $scrollspy.classList.add('list-scrollspy-fixed');
                    // reset to false, so we can act against when scrolling down.
                    passtThreasHold = false;
                  }
                }
              }
              if (ratio < 0.4) {
                let $topbar = document.querySelector('div[data-component-id="archipelago_subtheme_dcpl:page"] > nav.navbar');
                if (!$topbar.classList.contains('intersected')) {
                  $topbar.classList.add('intersected');
                }
              }
              else if (ratio > 0.6) {
                let $topbar = document.querySelector('div[data-component-id="archipelago_subtheme_dcpl:page"] > nav.navbar');
                let $scrollspy = document.querySelector('.list-scrollspy');
                if ($topbar.classList.contains('intersected')) {
                  $topbar.classList.remove('intersected');
                }
              }
              if (ratio > 0.5) {
                let $scrollspy = document.querySelector('.list-scrollspy');
                if ($scrollspy) {
                  if ($scrollspy.classList.contains('list-scrollspy-fixed')) {
                    $scrollspy.classList.remove('list-scrollspy-fixed');
                    UnSetFixedPositioning($scrollspy);
                  }
                }
              }
            },{
              root: null,
              rootMargin: '0px 0px',
              threshold: [...Array(40).keys()].map(x => x / 40)
            });



            var observerAfter = new IntersectionObserver(function (entries) {
              const ratio = entries[0].intersectionRatio;
              console.log("after" + ratio)
              if (ratio >= 0.8 && !passtThreasHold) {
                let $scrollspy = document.querySelector('.list-scrollspy');
                if ($scrollspy) {
                  if ($scrollspy.classList.contains('list-scrollspy-fixed')) {
                    passtThreasHold = true;
                    SetAbsolutePositioning($scrollspy);
                    $scrollspy.classList.remove('list-scrollspy-fixed');
                  }
                }
              }
              else if(ratio <= 0.8 && passtThreasHold && document.querySelector("body").classList.contains('scrollup')) {
                let $scrollspy = document.querySelector('.list-scrollspy');
                if ($scrollspy) {
                  passtThreasHold = false;
                  SetFixedPositioning($scrollspy);
                  $scrollspy.classList.add('list-scrollspy-fixed');
                }
              }
              // So here is the hard thing. On scroll down we will move from 0 to 1 but then again to 0
              // which might trigger again a "fixed". So we need a 3 state thing
              // where once 1 and scrolling down we stay there and only a 0 from 1 when scrolling up should
              // re-fix the nav. Too much engineering.
              // Also this threshold is in 10 increments to make it less sensitive and also less CPU
              // consuming.
            },{
              root: null,
              rootMargin: '-35% 0% -45% 0%',
              threshold: 1
            });

            let $observedElement = document.querySelector('div[data-component-id="archipelago_subtheme_dcpl:page"] .page__header');
            let $observedAfterElement = document.querySelector("#scrollspyAfter");
            if ($observedElement && $observedAfterElement) {
              observer.observe($observedElement)
            }

            if ($observedAfterElement) {
              observerAfter.observe($observedAfterElement)
            }
          }
        );
    }
  }

})(jQuery, Drupal, once, Mark);
