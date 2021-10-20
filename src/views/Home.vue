<template>
  <v-card :loading="loading">
    <v-card-title>
      <span>Python dict to JSON</span>
      <v-spacer/>

      <div v-if="!getSource">
        <span v-if="share">
          <span class="text-caption"><kbd>{{ share }}</kbd></span>
          <v-btn class="ml-2" icon @click="onCopy(share)">
            <v-icon>mdi-content-copy</v-icon>
          </v-btn>
        </span>

        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              icon
              :loading="saveLoading"
              v-bind="attrs"
              v-on="on"
              @click="shareAndSave"
            >
              <v-icon>mdi-share-variant</v-icon>
            </v-btn>
          </template>
          <span>Share</span>
        </v-tooltip>
      </div>
      <div v-else>
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              icon
              :loading="saveLoading"
              v-bind="attrs"
              v-on="on"
              @click="updateSource"
            >
              <v-icon>mdi-content-save</v-icon>
            </v-btn>
          </template>
          <span>Save</span>
        </v-tooltip>
      </div>

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.type"
        :timeout="snackbar.timeout"
        top
      >
        {{ snackbar.msg }}
        <template #action="{ attrs }">
          <v-btn
            text
            v-bind="attrs"
            @click="snackbar.show = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-card-title>
    <v-divider/>
    <v-card-text>
      <div>
        <v-btn
          class="my-1 mr-1"
          fab
          depressed
          x-small
          @click="onCopy(source)"
        >
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        <v-btn
          class="my-1"
          fab
          depressed
          x-small
          @click="clearSource"
        >
          <v-icon small>mdi-delete</v-icon>
        </v-btn>
      </div>
      <v-textarea
        v-model="source"
        counter
        filled
        :error="!!error"
        :error-messages="!!error ? [error] : null"
        :hint="(source || '').trim().length ? '' : hint"
        label="Input"
        no-resize
        persistent-hint
        rows="10"
      />
      <div class="mt-4">
        <v-btn
          class="my-1 mr-1"
          fab
          depressed
          x-small
          @click="onCopy(response.body)"
        >
          <v-icon small>mdi-content-copy</v-icon>
        </v-btn>
        <v-btn
          class="my-1"
          fab
          depressed
          x-small
          @click="clearResponse"
        >
          <v-icon small>mdi-delete</v-icon>
        </v-btn>
      </div>
      <v-textarea
        v-model="response.body"
        :counter="!response.error"
        filled
        :error="!!response.error"
        :success="!!response.body"
        label="Output"
        no-resize
        rows="10"
      />
      <v-btn
        block
        @click="convertToJson"
      >Convert</v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import axios from '@/plugins/axios';

export default {
  name: 'Home',
  data: () => ({
    source: null,
    error: null,
    response: {
      body: null,
      error: null,
    },
    hint: 'Example: {\'commercial\': True, \'offer_type\': \'sale\', \'property_type\': '
        + 'None, \'property_type_dscr\': None}',
    share: null,
    loading: false,
    snackbar: {
      type: 'success',
      show: false,
      msg: '',
      timeout: 2000,
    },
    saveLoading: false,
  }),
  computed: {
    getSource() {
      return this.$route.params.source;
    },
  },
  async created() {
    if (this.getSource) {
      await this.getSavedSource();
    } else {
      this.source = localStorage.getItem('cached_input');
    }
    await this.convertToJson();
  },
  methods: {
    async convertToJson() {
      const source = (this.source || '').trim();
      if (!source) return;

      this.loading = true;
      await axios.post('/api/pydict-to-json', { source })
        .then(({ data }) => {
          this.error = null;
          this.response.body = data.res || data.err;
          this.response.error = Boolean(data.err);
          localStorage.setItem('cached_input', source);
        })
        .catch(({ response }) => {
          this.onError(response.data.detail);
        });
      this.loading = false;
    },

    async shareAndSave() {
      const source = (this.source || '').trim();
      if (!source) {
        this.error = 'Fill the input';
        return;
      }

      this.saveLoading = true;
      await axios.post('/api/save-and-share', { source })
        .then(({ data }) => {
          const { token } = data;
          this.share = new URL(`/source/${token}`, window.location.href).href;
        })
        .catch(({ response }) => {
          this.onError(response.data.detail);
        });
      this.saveLoading = false;
    },

    async getSavedSource() {
      this.loading = true;
      await axios.get(`/api/source/${this.getSource}`)
        .then(({ data }) => {
          this.source = data.source;
        })
        .catch(({ response }) => {
          this.onError(response.data.detail);
        });
      this.loading = false;
    },

    async updateSource() {
      const source = (this.source || '').trim();
      if (!source) {
        this.error = 'Fill the input';
        return;
      }
      if (source === localStorage.getItem('cached_input')) return;

      this.saveLoading = true;
      localStorage.setItem('cached_input', source);
      await axios.patch(`/api/source/${this.getSource}`, { source })
        .catch(({ response }) => {
          this.onError(response.data.detail);
        });
      this.saveLoading = false;
    },

    clearSource() {
      this.error = '';
      this.source = '';
      localStorage.removeItem('cached_input');
    },

    clearResponse() {
      this.response = { body: '', error: null };
    },

    onCopy(msg) {
      this.$copyText(msg).then(() => {
        this.onSuccess('Copied successfully');
      }, () => {
        this.onError('Error while coping');
      });
    },

    onSuccess(msg) {
      this.snackbar = {
        show: true,
        msg,
        type: 'success',
        timeout: 2000,
      };
    },

    onError(msg) {
      this.error = '';
      this.share = '';
      this.response = { body: '', error: null };
      this.snackbar = {
        show: true,
        msg,
        type: 'error',
        timeout: -1,
      };
    },
  },
};
</script>
