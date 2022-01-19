<script>
export default {
  /* Note: will need to use inline template for unit test */
  template: '#helloWorld',
  name: 'HelloWorld',
  props: {
    msg: String
  },
  /* Anything returned from the data method is added as a property on
   * the component and can be accessed via this.[property name] */
  data() {
    return {
      /* Example of html binding */
      listName: '<b>Ecosystem!</b>',
      message: 'Welcome to your Vue!',
      devTools: 'https://github.com/vuejs/vue-devtools#vue-devtools',
      fullBind: 'https://github.com/vuesomedev/awesome-vue-3',
      shortBind: 'https://v3.vuejs.org/guide/template-syntax.html#v-bind-shorthand'
    };
  },
  methods: {
    /* template method can only be called in html node interpolation,
     * will not work for an attribute */
    getMessage() {
      return this.message;
    },
    clickHandler(event) {
      event.preventDefault();
      console.log(`You clicked ${event.target.innerText}`);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
:deep(.content) {
  text-align: left;
  h3 {
    margin: 40px 0 0;
    font-size: 18px;
  }
  ul {
    list-style-type: none;
    padding: 0;
    li {
      display: inline-block;
      margin: 0 10px;
      a {
        color: #42b983;
      }
    }
  }
}

a {
  color: #42b983;
  &.btn {
    color: #0d6efd;
    &:hover {
      color: #fff;
    }
  }
}
</style>
