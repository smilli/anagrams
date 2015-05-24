import math
import json
from itertools import chain
from collections import defaultdict
from nltk.corpus import gutenberg
from nltk import ngrams

def valid_word(word):
    return word.isalpha() and word[1:].islower()

def generate_ngram_model(n=3):
    """Generate an ngram character model"""
    char_ngrams = chain.from_iterable(
        ngrams(w.lower(), n=n, pad_left=True,pad_right=True, pad_symbol='_')
        for w in gutenberg.words() if valid_word(w))
    cond_freq_dist = defaultdict(lambda: defaultdict(int))
    for ngram in char_ngrams:
        cond_freq_dist[''.join(ngram[:-1])][ngram[-1]] += 1
    cond_prob_dist = defaultdict(lambda: dict())
    for cond, char_freqs in cond_freq_dist.items():
        total_freq = sum(freq for freq in char_freqs.values())
        for char, freq in char_freqs.items():
            cond_prob_dist[cond][char] = math.log(freq/total_freq)
    return cond_prob_dist

def cpd_to_json(cpd, write_file):
    with open(write_file, 'w') as f:
        json.dump(cpd, f)

if __name__ == '__main__':
    cpd = generate_ngram_model(3)
    cpd_to_json(cpd, 'cpd.json')
