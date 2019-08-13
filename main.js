Vue.config.devtools = true

var eventBus = new Vue();

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        },
        cart: {
            type: Array,
            required: true
        }
    },
    template: `
            <div class="product">

                <div class="product-image">
                    <img :src="image">
                </div>

                <div class="product-info" :class="{noStock : !inStock}">
                    <h1>{{ title }}</h1>
                    <p v-if="inStock">In Stock</p>
                    <p v-else :class="{ outOfStock : !inStock}">Out of Stock</p>
                    <p>{{ onSale }}</p>

                    <info-tabs :shipping="shipping" :details="details"></info-tabs>

                    <div v-for="(variant, index) in variants" 
                        :key="variant.variantId"
                        class="color-box"
                        :style="{ backgroundColor: variant.variantColor }"
                        @mouseover="updateProduct(index)">
                    </div>

                    <button @click="addToCart" 
                            :disabled="!inStock"
                            :class="{ disabledButton: !inStock }">Add to Cart</button>

                    <button :disabled="cartValue"
                            @click="removeToCart"
                            :class="{ disabledButton: cartValue }">Remove to Cart</button>



                </div> 

                <product-tabs :reviews="reviews"></product-tabs>
                
                
            </div> `,
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            selectedVariant: 0,
            details: ["80% Cotton", "20% polyester", "Gender-neutral"],
            variants: [
                {
                    variantId: 1493,
                    variantColor: "green",
                    variantImage: "./assets/socks-green.png",
                    variantQuantity: 100,
                    variantOnSale: false
                },
                {
                    variantId: 1501,
                    variantColor: "blue",
                    variantImage: "./assets/socks-blue.png",
                    variantQuantity: 0,
                    variantOnSale: true
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
            // this.cart += 1;
        },
        removeToCart() {
            this.$emit('remove-to-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct(index) {
            this.selectedVariant = index
            // console.log(index)
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        onSale() {
            if (this.variants[this.selectedVariant].variantOnSale == true) {
                return this.title + " - " + this.variants[this.selectedVariant].variantColor + " is on sale!"
            } else {
                return this.title + " - " + this.variants[this.selectedVariant].variantColor + " aren't on sale!"
            }
        },
        shipping() {
            if (this.premium) {
                return "Free"
            }
            return 2.99
        },
        cartValue() {
            if (this.cart.length <= 0) {
                return true
            }
            return false
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }

});

Vue.component('info-tabs', {
    props:{
        shipping: {
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <div>

        <ul>
            <span class="tabs"
                    :class="{ activeTab: selectedTab === tab }"
                    v-for="(tab, index) in tabs"
                    @click="selectedTab = tab"
                    :key="tab"
            >{{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Shipping'">
            <p>Shipping: {{ shipping }}</p>
        </div>
        
        
        <div v-show="selectedTab === 'Details'">
            <product-details :details="details"></product-details>
        </div>

    </div>
    `,
    data () {
        return {
            tabs: ['Shipping','Details'],
            selectedTab: 'Shipping'
        }
    }
})


Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
    <div>
        <span class="tabs" 
            :class="{ activeTab: selectedTab === tab }"
            v-for="(tab, index) in tabs" 
            :key="index"
            @click="selectedTab = tab"
            >{{ tab }}</span>



        <div v-show="selectedTab === 'Reviews'">
            <h2>Reviews </h2>
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul>
                <li v-for="review in reviews">
                <p>{{ review.name }}</p?
                <p>Rating: {{ review.rating }}</p?
                <p>{{ review.review }}</p?
                <p>Recommend: {{ review.recommend }}</p?
                </li>
            </ul>
        </div>

        <product-review v-show="selectedTab === 'Post a Review'"></product-review>

    </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Post a Review'],
            selectedTab: 'Reviews'
        }
    }
})

Vue.component('product-review', {
    template: `<form class="review-form" @submit.prevent="onSubmit">
    
    <p v-if="errors.length">
        <b>Please check the following error(s):</b>
        <ul>
            <li v-for="error in errors">{{ error }}</li>
        </ul>
    </p>

      <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" placeholder="name">
      </p>
      
      <p>
        <label for="review">Review:</label>      
        <textarea id="review" v-model="review"></textarea>
      </p>
      
      <p>
        <label for="rating">Rating:</label>
        <select id="rating" v-model.number="rating">
          <option>5</option>
          <option>4</option>
          <option>3</option>
          <option>2</option>
          <option>1</option>
        </select>
      </p>

      <p>Would you recommend this product?</p>
        <label>
          Yes
          <input type="radio" value="Yes" v-model="recommend"/>
        </label>
        <label>
          No
          <input type="radio" value="No" v-model="recommend"/>
        </label>
          
      <p>
        <input type="submit" value="Submit">  
      </p>    
    
    </form>`,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = [];
            if (this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if (!this.recommend) this.errors.push("Recommendation required.")
            }
        }
    }
})

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            require: true
        }
    },
    template: `
    <ul>
        <li v-for="detail in details">{{ detail }}</li>
    </ul>
    `
})

const app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        addCart(id) {
            this.cart.push(id);
        },
        removeCart(id) {
            this.cart.splice(this.cart.indexOf(id), 1);
        }
    }
})